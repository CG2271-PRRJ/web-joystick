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
	const [commandStack, setCommandStack] = useState([]); // [1, 2, 3, 4, 5, 6, 7, 8, 9
	const [left, setLeft] = useState(7);
	const [right, setRight] = useState(7);

	function startConnect() {
		let clientID = "clientID - " + parseInt(Math.random() * 100);
		let host = "192.168.230.6";
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

	function clearStack() {
		setCommandStack([]);
	}

	function pushToStack(command) {
		setCommandStack((prevStack) => [...prevStack, command]);
	}

	function popFromStack(command) {
		setCommandStack((prevStack) => {
			const index = prevStack.lastIndexOf(command);
			if (index !== -1) {
				const newStack = [...prevStack];
				newStack.splice(index, 1);
				return newStack;
			}
			return prevStack;
		});
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

	useEffect(() => {
		// Transmit the command on top of the stack
		const cmd =
			commandStack.length > 0 ? commandStack[commandStack.length - 1] : STOP;
		sendNum(cmd);

		// Logging the updated stack
		console.log("Updated command stack:", commandStack);
	}, [commandStack]);

	return (
		<div classname="full-contatiner">
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
						onTouchStart={() => pushToStack(FORFAST)}
						onTouchEnd={() => popFromStack(FORFAST)}
					>
						forward-fast
					</button>
					<button className="invisible"></button> {/* empty top-left */}
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(LEFT)}
						onTouchEnd={() => popFromStack(LEFT)}
					>
						left
					</button>
					<button
						className="movebutton"
						onTouchStart={clearStack}
						onTouchEnd={clearStack}
					>
						stop
					</button>
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(RIGHT)}
						onTouchEnd={() => popFromStack(RIGHT)}
					>
						right
					</button>
					<button className="invisible"></button>
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(REVFAST)}
						onTouchEnd={() => popFromStack(REVFAST)}
					>
						reverse-fast
					</button>
					<button className="invisible"></button>
				</div>

				<div className="dpadright">
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(FORLEFT)}
						onTouchEnd={() => popFromStack(FORLEFT)}
					>
						forward-left
					</button>
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(FORRIGHT)}
						onTouchEnd={() => popFromStack(FORRIGHT)}
					>
						forward-right
					</button>
					<button
						className="movebutton"
						onTouchStart={() => pushToStack(REVLEFT)}
						onTouchEnd={() => popFromStack(REVLEFT)}
					>
						reverse-left
					</button>

					<button
						className="movebutton"
						onTouchStart={() => pushToStack(REVRIGHT)}
						onTouchEnd={() => popFromStack(REVRIGHT)}
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
					onTouchStart={() => pushToStack(left * 15 + right)}
					onTouchEnd={() => popFromStack(left * 15 + right)}
				>
					Send Custom
				</button>
			</div>
		</div>
	);
}

export default App;
