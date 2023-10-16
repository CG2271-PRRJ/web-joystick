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
		<div classname='full-contatiner'>
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
				<div className="dpadleft">
					<button className="invisible"></button> {/* empty top-left */}
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						forward-fast
					</button>
					<button className="invisible"></button> {/* empty top-left */}
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
					<button className="invisible"></button> 
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVFAST)}
						onTouchEnd={() => sendNum(STOP)}
					>
						reverse-fast
					</button>
					<button className="invisible"></button> 
				</div>

				<div className="dpadright">
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORLEFT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						forward-left
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(FORRIGHT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						forward-right
					</button>
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVLEFT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						reverse-left
					</button>
				
					<button
						className="movebutton"
						onTouchStart={() => sendNum(REVRIGHT)}
						onTouchEnd={() => sendNum(STOP)}
					>
						reverse-right
					</button>
				</div>
			</div>
			<div className="bottom-container">
				<input
					type="number"
					onChange={(e) => setLeft(Number(e.target.value))}
				/>
				<input
					type="number"
					onChange={(e) => setRight(Number(e.target.value))}
				/>
				<button
					className="custombutton"
					onTouchStart={() => sendNum(left * 15 + right)}
					onTouchEnd={() => sendNum(STOP)}
				>
					Send Custom
				</button>
			</div>
		</div>
	);
}

export default App;
