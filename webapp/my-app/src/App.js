import "./App.css";
import { Joystick } from "react-joystick-component";
import { useState, useEffect, useRef } from "react";
import Paho from "paho-mqtt";

const FORLEFTFAST = 134;
const FORFAST = 224;
const FORRIGHTFAST = 218;

const FORLEFT = 119;
const FOR = 192;
const FORRIGHT = 217;

const LEFTFAST = 28;
const LEFT = 56;
const STOP = 112;
const RIGHT = 168;
const RIGHTFAST = 196;

const REVLEFT = 105;
const REV = 32;
const REVRIGHT = 7;

const REVLEFTFAST = 90;
const REVFAST = 0;
const REVRIGHTFAST = 6;

function App() {
	// initiate useState for X, Y, and a key for the joystick
	// const [bignum, setBignum] = useState(112);
	const [client, setClient] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [left, setLeft] = useState(7);
	const [right, setRight] = useState(7);

	function startConnect() {
		let clientID = "clientID - " + parseInt(Math.random() * 100);
		let host = "192.168.108.6";
		let port = 9001;
		var newcli = new Paho.Client(host, Number(port), clientID);
		newcli.onConnectionLost = onConnectionLost;
		newcli.connect({
			onSuccess: onConnect,
		});
		setClient(newcli);
	}

	function onConnect(responseObject) {
		//   console.log("Connected!");
		setIsConnected(true);
	}

	function onConnectionLost(responseObject) {
		// console.log("Connection Lost: "+responseObject.errorMessage);
		setIsConnected(false);
	}

	function disconnect() {
		if (client !== null && client.isConnected()) {
			client.disconnect();
			setClient(null);
			setIsConnected(false);
		}
	}

	function sendNum(number) {
		if (number < 0 || number > 255) {
			return;
		}

		if (client !== null && client.isConnected()) {
			let byteArray = new Uint8Array([number]);

			let message = new Paho.Message(byteArray.buffer);
			message.destinationName = "joystick/value";
			client.send(message);
		}
	}

	return (
		<>
			<div className="top-container">
				<div>
					<button onClick={startConnect}>Connect</button>
					<button onClick={disconnect}>disconnect</button>
				</div>
				<div>
					<button onClick={() => sendNum(225)}>Normal Song</button>
					<button onClick={() => sendNum(226)}>Alt Song</button>
				</div>
			</div>
			<p>
				Connected:
				<span
					style={{
						color: isConnected ? "green" : "red",
						fontWeight: "bold",
						fontSize: "1.2em",
					}}
				>
					{isConnected ? "true" : "false"}
				</span>
			</p>
			<div className="center-container">
				<div className="dpad">
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORLEFTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						for-left-fast
					</button>
					<button className="invisible"></button> {/* empty top-left */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						forward-fast
					</button>
					<button className="invisible"></button> {/* empty top-right */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORRIGHTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						for-right-fast
					</button>
					{/*  */}
					<button className="invisible"></button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORLEFT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						for-left
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FOR)}
						onTouchEnd={() => sendNum(STOP)}
					>
						forward
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORRIGHT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						for-right
					</button>
					<button className="invisible"></button>
					{/*  */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(LEFTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						left-fast
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(LEFT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						left
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(STOP)}
						onTouchEnd={() => sendNum(STOP)}
					>
						stop
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(RIGHT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						right
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(RIGHTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						right-fast
					</button>
					{/*  */}
					<button className="invisible"></button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVLEFT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						rev-left
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REV)}
						onTouchEnd={() => sendNum(STOP)}
					>
						reverse
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVRIGHT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						rev-right
					</button>
					<button className="invisible"></button>
					{/*  */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVLEFTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						rev-left-fast
					</button>
					<button className="invisible"></button> {/* empty top-left */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						reverse-fast
					</button>
					<button className="invisible"></button> {/* empty top-right */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVRIGHTFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						rev-right-fast
					</button>
				</div>
			</div>
			<div>
				<input
					type="number"
					onChange={(e) => setLeft(Number(e.target.value))}
				/>
				<input
					type="number"
					onChange={(e) => setRight(Number(e.target.value))}
				/>
				<button
					className="movebutton"
					onTouchStart={() => sendNum(left * 15 + right)}
					onTouchEnd={() => sendNum(STOP)}
				>
					Send Custom
				</button>
			</div>
		</>
	);
}

export default App;
