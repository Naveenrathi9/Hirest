"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  ShieldCheck,
  User,
  Wifi,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";

interface LiveInterviewRoomProps {
  sessionId: string;
  currentUserRole: "candidate" | "interviewer";
  currentUserName: string;
  remoteUserName?: string;
  domain?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  onEndCall: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  sessionId,
  currentUserRole,
  currentUserName,
  remoteUserName,
  domain = "Mock Interview Track",
  scheduledDate,
  scheduledTime,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState<
    "requesting-media" | "waiting-for-peer" | "connecting" | "connected" | "reconnecting" | "error"
  >("requesting-media");

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false);
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  const makingOfferRef = useRef(false);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const isPolite = currentUserRole === "candidate";

  // Cleanup helper
  const cleanupCall = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "peer-left", senderRole: currentUserRole },
        });
        channelRef.current.unsubscribe();
      } catch {}
      channelRef.current = null;
    }
    setHasRemoteStream(false);
  }, [currentUserRole]);

  // WebRTC Setup Effect
  useEffect(() => {
    let isCancelled = false;

    const initWebRTC = async () => {
      try {
        setCallStatus("requesting-media");
        setErrorMessage(null);

        // 1. Get Camera and Microphone
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              facingMode: "user",
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (mediaErr) {
          console.warn("Failed standard video+audio, trying fallback audio only:", mediaErr);
          // Try audio only if camera is blocked/busy
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoOn(false);
          } catch (audioErr: any) {
            if (!isCancelled) {
              setErrorMessage(
                "Unable to access camera or microphone. Please ensure browser permissions are allowed and no other app is using the camera."
              );
              setCallStatus("error");
            }
            return;
          }
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setCallStatus("waiting-for-peer");

        // 2. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Handle incoming remote stream
        pc.ontrack = (event) => {
          console.log("WebRTC: Received remote track ->", event.track.kind);
          const [incomingStream] = event.streams;
          if (incomingStream) {
            remoteStreamRef.current = incomingStream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = incomingStream;
            }
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = incomingStream;
              remoteAudioRef.current.play().catch(() => {
                console.log("Autoplay audio waiting for user interaction");
              });
            }
            if (!isCancelled) {
              setHasRemoteStream(true);
              setCallStatus("connected");
            }
          }
        };

        // 4. Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && channelRef.current) {
            channelRef.current.send({
              type: "broadcast",
              event: "signal",
              payload: {
                type: "ice-candidate",
                candidate: event.candidate.toJSON(),
                senderRole: currentUserRole,
              },
            });
          }
        };

        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          console.log("ICE Connection State:", state);
          if (isCancelled) return;
          if (state === "connected" || state === "completed") {
            setCallStatus("connected");
          } else if (state === "disconnected") {
            setCallStatus("reconnecting");
          } else if (state === "failed") {
            // Attempt ICE restart
            pc.restartIce();
            setCallStatus("reconnecting");
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("Peer Connection State:", pc.connectionState);
          if (isCancelled) return;
          if (pc.connectionState === "connected") {
            setCallStatus("connected");
          } else if (pc.connectionState === "disconnected") {
            setCallStatus("waiting-for-peer");
            setHasRemoteStream(false);
          }
        };

        // 5. Connect to Supabase Realtime Signaling Room
        const roomName = `webrtc-call-${sessionId}`;
        console.log("Connecting to Supabase Realtime channel:", roomName);

        const channel = supabase.channel(roomName, {
          config: { broadcast: { self: false } },
        });
        channelRef.current = channel;

        // Signaling message handler
        channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
          if (!payload || payload.senderRole === currentUserRole || !pcRef.current) {
            return;
          }

          const currentPc = pcRef.current;

          try {
            if (payload.type === "peer-joined") {
              console.log("Peer joined the room:", payload.senderRole);
              // Send back confirmation that we are ready
              channel.send({
                type: "broadcast",
                event: "signal",
                payload: { type: "peer-ready", senderRole: currentUserRole },
              });

              // Interviewer creates the offer when peer joins
              if (currentUserRole === "interviewer") {
                await initiateOffer(currentPc, channel);
              }
            } else if (payload.type === "peer-ready") {
              console.log("Peer announced ready:", payload.senderRole);
              if (currentUserRole === "interviewer") {
                await initiateOffer(currentPc, channel);
              }
            } else if (payload.type === "offer") {
              console.log("Received SDP offer from:", payload.senderRole);
              const offerCollision =
                makingOfferRef.current || currentPc.signalingState !== "stable";

              if (offerCollision && !isPolite) {
                console.log("Offer collision: impolite peer ignoring incoming offer");
                return;
              }

              if (offerCollision && isPolite) {
                console.log("Offer collision: polite peer rolling back local offer");
                await currentPc.setLocalDescription({ type: "rollback" } as any);
              }

              await currentPc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

              // Process any queued ICE candidates
              while (candidateQueueRef.current.length > 0) {
                const queued = candidateQueueRef.current.shift();
                if (queued) {
                  await currentPc.addIceCandidate(new RTCIceCandidate(queued)).catch(console.warn);
                }
              }

              const answer = await currentPc.createAnswer();
              await currentPc.setLocalDescription(answer);

              channel.send({
                type: "broadcast",
                event: "signal",
                payload: {
                  type: "answer",
                  sdp: answer,
                  senderRole: currentUserRole,
                },
              });
            } else if (payload.type === "answer") {
              console.log("Received SDP answer from:", payload.senderRole);
              await currentPc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

              // Process any queued ICE candidates
              while (candidateQueueRef.current.length > 0) {
                const queued = candidateQueueRef.current.shift();
                if (queued) {
                  await currentPc.addIceCandidate(new RTCIceCandidate(queued)).catch(console.warn);
                }
              }
            } else if (payload.type === "ice-candidate") {
              const candidate = payload.candidate;
              if (candidate) {
                if (currentPc.remoteDescription && currentPc.remoteDescription.type) {
                  await currentPc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
                } else {
                  candidateQueueRef.current.push(candidate);
                }
              }
            } else if (payload.type === "media-toggle") {
              if (payload.mediaType === "audio") {
                setIsRemoteAudioMuted(!payload.enabled);
              } else if (payload.mediaType === "video") {
                setIsRemoteVideoMuted(!payload.enabled);
              }
            } else if (payload.type === "peer-left") {
              console.log("Peer left the room");
              if (!isCancelled) {
                setHasRemoteStream(false);
                setCallStatus("waiting-for-peer");
              }
            }
          } catch (err) {
            console.error("WebRTC Signaling Error:", err);
          }
        });

        // Subscribe to channel
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to room, announcing peer-joined...");
            channel.send({
              type: "broadcast",
              event: "signal",
              payload: { type: "peer-joined", senderRole: currentUserRole },
            });
          }
        });
      } catch (err: any) {
        console.error("Failed to start interview call:", err);
        if (!isCancelled) {
          setErrorMessage(err.message || "Failed to initialize call.");
          setCallStatus("error");
        }
      }
    };

    // Helper: Initiate WebRTC Offer
    const initiateOffer = async (pc: RTCPeerConnection, channel: any) => {
      try {
        if (makingOfferRef.current) return;
        makingOfferRef.current = true;
        console.log("Creating WebRTC Offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        channel.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "offer",
            sdp: offer,
            senderRole: currentUserRole,
          },
        });
      } catch (err) {
        console.error("Error creating offer:", err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    initWebRTC();

    return () => {
      isCancelled = true;
      cleanupCall();
    };
  }, [sessionId, currentUserRole, isPolite, cleanupCall]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isMicOn;
      audioTracks.forEach((t) => (t.enabled = nextState));
      setIsMicOn(nextState);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "media-toggle",
            mediaType: "audio",
            enabled: nextState,
            senderRole: currentUserRole,
          },
        });
      }
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isVideoOn;
      videoTracks.forEach((t) => (t.enabled = nextState));
      setIsVideoOn(nextState);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "media-toggle",
            mediaType: "video",
            enabled: nextState,
            senderRole: currentUserRole,
          },
        });
      }
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in peer connection
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        // Preview screen locally
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current && pcRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    setIsScreenSharing(false);
  };

  // Restart / Reconnect call manually if needed
  const handleReconnect = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "signal",
        payload: { type: "peer-joined", senderRole: currentUserRole },
      });
      if (pcRef.current) {
        pcRef.current.restartIce();
      }
    }
  };

  const targetRoleTitle = currentUserRole === "candidate" ? "Interviewer" : "Candidate";
  const effectiveRemoteName =
    remoteUserName || (currentUserRole === "candidate" ? "Verified Interviewer" : "Candidate");

  return (
    <div className="relative w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col min-h-[460px] lg:min-h-[520px]">
      {/* Top Session Status Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-slate-950/90 to-transparent">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              callStatus === "connected"
                ? "bg-emerald-500 animate-pulse"
                : callStatus === "connecting"
                ? "bg-amber-400 animate-ping"
                : "bg-blue-400"
            }`}
          />
          <span className="text-xs font-bold text-white tracking-wide">
            {callStatus === "connected"
              ? "Live HD 1-on-1 Session"
              : callStatus === "connecting"
              ? "Connecting Peer Call..."
              : `Waiting for ${targetRoleTitle}...`}
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
            Room #{sessionId.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {callStatus === "connected" && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Encrypted P2P</span>
            </span>
          )}
          <button
            onClick={handleReconnect}
            title="Reconnect Signaling"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video View: Remote Peer */}
      <div className="relative flex-1 w-full h-full min-h-[380px] flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Remote Video Stream */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hasRemoteStream && !isRemoteVideoMuted ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
        />

        {/* Dedicated Audio Element for Remote Sound */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {/* When Remote Peer is Connected but Video is Off */}
        {hasRemoteStream && isRemoteVideoMuted && (
          <div className="text-center text-white space-y-3 z-10 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 text-white font-extrabold text-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-slate-700">
              {effectiveRemoteName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{effectiveRemoteName}</h3>
              <p className="text-xs text-slate-400">Camera turned off • Audio connected</p>
            </div>
          </div>
        )}

        {/* Waiting / Connecting State Placeholder */}
        {!hasRemoteStream && (
          <div className="text-center text-white px-6 max-w-md mx-auto space-y-4 z-10 animate-fade-in">
            {callStatus === "error" ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-red-200">Camera or Mic Required</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {errorMessage || "Please allow camera and microphone permissions to start the live interview call."}
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-2xl border-4 border-slate-800">
                    {effectiveRemoteName.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Waiting for {targetRoleTitle} to Join
                  </h3>
                  <p className="text-xs text-blue-300 font-medium">
                    {effectiveRemoteName} • {domain}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-2 leading-relaxed max-w-xs mx-auto">
                    Your camera and microphone are active. The video and audio call will connect automatically as soon
                    as the {targetRoleTitle.toLowerCase()} enters the room.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Listening for incoming connection...</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Remote Participant Name Tag & Audio Status */}
        {hasRemoteStream && (
          <div className="absolute bottom-20 left-4 z-20 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-white">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold">{effectiveRemoteName}</span>
            <span className="text-[10px] text-slate-400">({targetRoleTitle})</span>
            {isRemoteAudioMuted && (
              <span className="text-red-400 flex items-center gap-0.5 text-[10px]">
                <MicOff className="w-3 h-3" />
                <span>Muted</span>
              </span>
            )}
          </div>
        )}

        {/* Picture-in-Picture: Local Camera Feed */}
        <div className="absolute top-16 right-4 z-30 w-36 sm:w-48 aspect-video bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden group">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity ${isVideoOn ? "opacity-100" : "opacity-0"}`}
          />

          {!isVideoOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-1">
                {currentUserName.substring(0, 2).toUpperCase() || "YOU"}
              </div>
              <span className="text-[10px] text-slate-400">Camera Off</span>
            </div>
          )}

          {/* Local User Badge */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
            <span className="font-semibold truncate">You ({currentUserRole})</span>
            {!isMicOn && <MicOff className="w-3 h-3 text-red-400 shrink-0" />}
          </div>
        </div>
      </div>

      {/* In-Call Controls Floating Bar */}
      <div className="relative z-20 flex items-center justify-center gap-3.5 py-4 px-6 bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-md">
        {/* Toggle Microphone */}
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center ${
            isMicOn
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              : "bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400/50"
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center ${
            isVideoOn
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              : "bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-400/50"
          }`}
          title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Toggle Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center ${
            isScreenSharing
              ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/50"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen for Coding / Review"}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => {
            cleanupCall();
            onEndCall();
          }}
          className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
          title="End Live Interview"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">End Call</span>
        </button>
      </div>
    </div>
  );
};
