import RTCClient from "./rtc-client";
import {
	getDevices,
	serializeFormData,
	validator,
	resolutions
} from "./common";
import "./assets/style.scss";
import * as M from "materialize-css";
import { setFormData, parseFromSearch } from "./searchParam";

$(() => {
	setFormData(parseFromSearch());

	getDevices(function(devices) {
		devices.audios.forEach(function(audio) {
			$("<option/>", {
				value: audio.value,
				text: audio.name
			}).appendTo("#microphoneId");
		});
		devices.videos.forEach(function(video) {
			$("<option/>", {
				value: video.value,
				text: video.name
			}).appendTo("#cameraId");
		});
		resolutions.forEach(function(resolution) {
			$("<option/>", {
				value: resolution.value,
				text: resolution.name
			}).appendTo("#cameraResolution");
		});
		M.AutoInit();
	});

	const fields = ["appID", "channel"];

	let rtc = new RTCClient();

	$(".autoplay-fallback").on("click", function(e) {
		e.preventDefault();
		const id = e.target.getAttribute("id").split("video_autoplay_")[1];
		console.log("autoplay fallback");
		if (id === "local") {
			rtc._localStream
				.resume()
				.then(() => {
					Toast.notice("local resume");
					$(e.target).addClass("hide");
				})
				.catch(err => {
					Toast.error("resume failed, please open console see more details");
					console.error(err);
				});
			return;
		}
		const remoteStream = rtc._remoteStreams.find(
			item => `${item.getId()}` == id
		);
		if (remoteStream) {
			remoteStream
				.resume()
				.then(() => {
					Toast.notice("remote resume");
					$(e.target).addClass("hide");
				})
				.catch(err => {
					Toast.error("resume failed, please open console see more details");
					console.error(err);
				});
		}
	});

	$("#show_profile").on("change", function(e) {
		e.preventDefault();
		rtc.setNetworkQualityAndStreamStats(this.checked);
	});

	$("#join").on("click", function(e) {
		e.preventDefault();

		console.log("join");
		const params = serializeFormData();
		if (validator(params, fields)) {
			rtc.join(params).then(() => {
				rtc.publish();
			});
		}
	});

	$("#publish").on("click", function(e) {
		e.preventDefault();
		console.log("startLiveStreaming");
		const params = serializeFormData();
		if (validator(params, fields)) {
			rtc.publish();
		}
	});

	$("#unpublish").on("click", function(e) {
		e.preventDefault();
		console.log("stopLiveStreaming");
		const params = serializeFormData();
		if (validator(params, fields)) {
			rtc.unpublish();
		}
	});

	$("#leave").on("click", function(e) {
		e.preventDefault();
		console.log("leave");
		const params = serializeFormData();
		if (validator(params, fields)) {
			rtc.leave();
		}
	});

	$("#checkSy").on("click", function(e) {
		e.preventDefault();
		rtc._client.getTransportStats(stats => {
			document.getElementById("statRTT").innerHTML = `Current Transport RTT: ${
				stats.RTT
			}`;
			document.getElementById(
				"statNetworkType"
			).innerHTML = `Current Network Type: ${stats.networkType}`;
			document.getElementById(
				"statBandwidth"
			).innerHTML = `Current Transport OutgoingAvailableBandwidth: ${
				stats.OutgoingAvailableBandwidth
			}`;
		});
	});
	$("#checkSystem").on("click", function(e) {
		e.preventDefault();
		rtc._client.getSystemStats(stats => {
			document.getElementById(
				"statBattery"
			).innerHTML = `Current battery level: ${stats.BatteryLevel}`;
		});
	});
	$("#checkNetwork").on("click", function(e) {
		e.preventDefault();
		rtc._client.getTransportStats(stats => {
			document.getElementById("statRTT").innerHTML = `Current Transport RTT: ${
				stats.RTT
			}`;
			document.getElementById(
				"statNetworkType"
			).innerHTML = `Current Network Type: ${stats.networkType}`;
			document.getElementById(
				"statBandwidth"
			).innerHTML = `Current Transport OutgoingAvailableBandwidth: ${
				stats.OutgoingAvailableBandwidth
			}`;
		});
	});
	$("#checkSession").on("click", function(e) {
		e.preventDefault();
		rtc._client.getSessionStats(stats => {
			document.getElementById(
				"statDuration"
			).innerHTML = `Current Session Duration: ${stats.Duration}`;
			document.getElementById(
				"statUserCount"
			).innerHTML = `Current Session UserCount: ${stats.UserCount}`;
			document.getElementById(
				"statSendBytes"
			).innerHTML = `Current Session SendBytes: ${stats.SendBytes}`;
			document.getElementById(
				"statRecvBytes"
			).innerHTML = `Current Session RecvBytes: ${stats.RecvBytes}`;
			document.getElementById(
				"statSendBitrate"
			).innerHTML = `Current Session SendBitrate: ${stats.SendBitrate}`;
			document.getElementById(
				"statRecvBtrate"
			).innerHTML = `Current Session RecvBitrate: ${stats.RecvBitrate}`;
		});
	});
	$("#checkAudioStream").on("click", function(e) {
		e.preventDefault();
		rtc._client.getLocalAudioStats(localAudioStats => {
			for (var uid in localAudioStats) {
				document.getElementById(
					"codecType"
				).innerHTML = `Audio CodecType from ${uid}: ${
					localAudioStats[uid].CodecType
				}`;
				document.getElementById(
					"MuteState"
				).innerHTML = `Audio MuteState from ${uid}: ${
					localAudioStats[uid].MuteState
				}`;
				document.getElementById(
					"RecordingLevel"
				).innerHTML = `Audio RecordingLevel from ${uid}: ${
					localAudioStats[uid].RecordingLevel
				}`;
				document.getElementById(
					"SamplingRate"
				).innerHTML = `Audio SamplingRate from ${uid}: ${
					localAudioStats[uid].SamplingRate
				}`;
				document.getElementById(
					"SendBitrate"
				).innerHTML = `Audio SendBitrate from ${uid}: ${
					localAudioStats[uid].SendBitrate
				}`;
				document.getElementById(
					"SendLevel"
				).innerHTML = `Audio SendLevel from ${uid}: ${
					localAudioStats[uid].SendLevel
				}`;
			}
		});
	});
	$("#checkNetworkQuality").on("click", function(e) {
		e.preventDefault();
		let networkStatus = [
			"Unknown",
			"Excellent",
			"Good",
			"Slightly Impaired",
			"Cannot communicate smoothly",
			"Bad",
			"Network Down"
		];
		rtc._client.on("network-quality", function(stats) {
			document.getElementById(
				"statUpNetwork"
			).innerHTML = `uplinkNetworkQuality : ${
				networkStatus[stats.uplinkNetworkQuality]
			}`;
			document.getElementById(
				"statDownNetwork"
			).innerHTML = `downlinkNetworkQuality : ${
				networkStatus[stats.downlinkNetworkQuality]
			}`;
		});
	});
	// rtc._client.getSessionStats(stats => {
	// 	console.log(`Current Session Duration: ${stats.Duration}`);
	// 	console.log(`Current Session UserCount: ${stats.UserCount}`);
	// 	console.log(`Current Session SendBytes: ${stats.SendBytes}`);
	// 	console.log(`Current Session RecvBytes: ${stats.RecvBytes}`);
	// 	console.log(`Current Session SendBitrate: ${stats.SendBitrate}`);
	// 	console.log(`Current Session RecvBitrate: ${stats.RecvBitrate}`);
	// });
	// rtc._client.getLocalAudioStats(localAudioStats => {
	// 	for (var uid in localAudioStats) {
	// 		console.log(
	// 			`Audio CodecType from ${uid}: ${localAudioStats[uid].CodecType}`
	// 		);
	// 		console.log(
	// 			`Audio MuteState from ${uid}: ${localAudioStats[uid].MuteState}`
	// 		);
	// 		console.log(
	// 			`Audio RecordingLevel from ${uid}: ${
	// 				localAudioStats[uid].RecordingLevel
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio SamplingRate from ${uid}: ${localAudioStats[uid].SamplingRate}`
	// 		);
	// 		console.log(
	// 			`Audio SendBitrate from ${uid}: ${localAudioStats[uid].SendBitrate}`
	// 		);
	// 		console.log(
	// 			`Audio SendLevel from ${uid}: ${localAudioStats[uid].SendLevel}`
	// 		);
	// 	}
	// });
	// rtc._client.getLocalVideoStats(localVideoStats => {
	// 	for (var uid in localVideoStats) {
	// 		console.log(
	// 			`Video CaptureFrameRate from ${uid}: ${
	// 				localVideoStats[uid].CaptureFrameRate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video CaptureResolutionHeight from ${uid}: ${
	// 				localVideoStats[uid].CaptureResolutionHeight
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video CaptureResolutionWidth from ${uid}: ${
	// 				localVideoStats[uid].CaptureResolutionWidth
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video EncodeDelay from ${uid}: ${localVideoStats[uid].EncodeDelay}`
	// 		);
	// 		console.log(
	// 			`Video MuteState from ${uid}: ${localVideoStats[uid].MuteState}`
	// 		);
	// 		console.log(
	// 			`Video SendBitrate from ${uid}: ${localVideoStats[uid].SendBitrate}`
	// 		);
	// 		console.log(
	// 			`Video SendFrameRate from ${uid}: ${
	// 				localVideoStats[uid].SendFrameRate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video SendResolutionHeight from ${uid}: ${
	// 				localVideoStats[uid].SendResolutionHeight
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video SendResolutionWidth from ${uid}: ${
	// 				localVideoStats[uid].SendResolutionWidth
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TargetSendBitrate from ${uid}: ${
	// 				localVideoStats[uid].TargetSendBitrate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TotalDuration from ${uid}: ${
	// 				localVideoStats[uid].TotalDuration
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TotalFreezeTime from ${uid}: ${
	// 				localVideoStats[uid].TotalFreezeTime
	// 			}`
	// 		);
	// 	}
	// });
	// rtc._client.getRemoteAudioStats(remoteAudioStatsMap => {
	// 	for (var uid in remoteAudioStatsMap) {
	// 		console.log(
	// 			`Audio CodecType from ${uid}: ${remoteAudioStatsMap[uid].CodecType}`
	// 		);
	// 		console.log(
	// 			`Audio End2EndDelay from ${uid}: ${
	// 				remoteAudioStatsMap[uid].End2EndDelay
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio MuteState from ${uid}: ${remoteAudioStatsMap[uid].MuteState}`
	// 		);
	// 		console.log(
	// 			`Audio PacketLossRate from ${uid}: ${
	// 				remoteAudioStatsMap[uid].PacketLossRate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio RecvBitrate from ${uid}: ${
	// 				remoteAudioStatsMap[uid].RecvBitrate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio RecvLevel from ${uid}: ${remoteAudioStatsMap[uid].RecvLevel}`
	// 		);
	// 		console.log(
	// 			`Audio TotalFreezeTime from ${uid}: ${
	// 				remoteAudioStatsMap[uid].TotalFreezeTime
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio TotalPlayDuration from ${uid}: ${
	// 				remoteAudioStatsMap[uid].TotalPlayDuration
	// 			}`
	// 		);
	// 		console.log(
	// 			`Audio TransportDelay from ${uid}: ${
	// 				remoteAudioStatsMap[uid].TransportDelay
	// 			}`
	// 		);
	// 	}
	// });
	// rtc._client.getRemoteVideoStats(remoteVideoStatsMap => {
	// 	for (var uid in remoteVideoStatsMap) {
	// 		console.log(
	// 			`Video End2EndDelay from ${uid}: ${
	// 				remoteVideoStatsMap[uid].End2EndDelay
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video MuteState from ${uid}: ${remoteVideoStatsMap[uid].MuteState}`
	// 		);
	// 		console.log(
	// 			`Video PacketLossRate from ${uid}: ${
	// 				remoteVideoStatsMap[uid].PacketLossRate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RecvBitrate from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RecvBitrate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RecvResolutionHeight from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RecvResolutionHeight
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RecvResolutionWidth from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RecvResolutionWidth
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RenderFrameRate from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RenderFrameRate
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RenderResolutionHeight from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RenderResolutionHeight
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video RenderResolutionWidth from ${uid}: ${
	// 				remoteVideoStatsMap[uid].RenderResolutionWidth
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TotalFreezeTime from ${uid}: ${
	// 				remoteVideoStatsMap[uid].TotalFreezeTime
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TotalPlayDuration from ${uid}: ${
	// 				remoteVideoStatsMap[uid].TotalPlayDuration
	// 			}`
	// 		);
	// 		console.log(
	// 			`Video TransportDelay from ${uid}: ${
	// 				remoteVideoStatsMap[uid].TransportDelay
	// 			}`
	// 		);
	// 	}
	// });
	// rtc._client.on("network-quality", function(stats) {
	// 	console.log("downlinkNetworkQuality", stats.downlinkNetworkQuality);
	// 	console.log("uplinkNetworkQuality", stats.uplinkNetworkQuality);
	// });
	// rtc._client.on("exception", function(evt) {
	// 	console.log(evt.code, evt.msg, evt.uid);
	// });
});
