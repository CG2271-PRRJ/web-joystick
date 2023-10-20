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

	const handleForwardFastTouchStart = useCallback(() => {
		pushToStack(FORFAST);
	}, []);

	const handleForwardFastTouchEnd = useCallback(() => {
		popFromStack(FORFAST);
	}, []);

	const handleForwardLeftFastTouchStart = useCallback(() => {
		pushToStack(FORLEFTFAST);
	}, []);

	const handleForwardLeftFastTouchEnd = useCallback(() => {
		popFromStack(FORLEFTFAST);
	}, []);

	const handleForwardRightFastTouchStart = useCallback(() => {
		pushToStack(FORRIGHTFAST);
	}, []);

	const handleForwardRightFastTouchEnd = useCallback(() => {
		popFromStack(FORRIGHTFAST);
	}, []);

	const handleForwardTouchStart = useCallback(() => {
		pushToStack(FOR);
	}, []);

	const handleForwardTouchEnd = useCallback(() => {
		popFromStack(FOR);
	}, []);

	const handleForwardLeftTouchStart = useCallback(() => {
		pushToStack(FORLEFT);
	}, []);

	const handleForwardLeftTouchEnd = useCallback(() => {
		popFromStack(FORLEFT);
	}, []);

	const handleForwardRightTouchStart = useCallback(() => {
		pushToStack(FORRIGHT);
	}, []);

	const handleForwardRightTouchEnd = useCallback(() => {
		popFromStack(FORRIGHT);
	}, []);

	const handleLeftFastTouchStart = useCallback(() => {
		pushToStack(LEFTFAST);
	}, []);

	const handleLeftFastTouchEnd = useCallback(() => {
		popFromStack(LEFTFAST);
	}, []);

	const handleLeftTouchStart = useCallback(() => {
		pushToStack(LEFT);
	}, []);

	const handleLeftTouchEnd = useCallback(() => {
		popFromStack(LEFT);
	}, []);

	const handleStopTouchStartEnd = useCallback(() => {
		clearStack();
	}, []);

	const handleRightTouchStart = useCallback(() => {
		pushToStack(RIGHT);
	}, []);

	const handleRightTouchEnd = useCallback(() => {
		popFromStack(RIGHT);
	}, []);

	const handleRightFastTouchStart = useCallback(() => {
		pushToStack(RIGHTFAST);
	}, []);

	const handleRightFastTouchEnd = useCallback(() => {
		popFromStack(RIGHTFAST);
	}, []);

	const handleReverseLeftFastTouchStart = useCallback(() => {
		pushToStack(REVLEFTFAST);
	}, []);

	const handleReverseLeftFastTouchEnd = useCallback(() => {
		popFromStack(REVLEFTFAST);
	}, []);

	const handleReverseRightFastTouchStart = useCallback(() => {
		pushToStack(REVRIGHTFAST);
	}, []);

	const handleReverseRightFastTouchEnd = useCallback(() => {
		popFromStack(REVRIGHTFAST);
	}, []);

	const handleReverseTouchStart = useCallback(() => {
		pushToStack(REV);
	}, []);

	const handleReverseTouchEnd = useCallback(() => {
		popFromStack(REV);
	}, []);

	const handleReverseLeftTouchStart = useCallback(() => {
		pushToStack(REVLEFT);
	}, []);

	const handleReverseLeftTouchEnd = useCallback(() => {
		popFromStack(REVLEFT);
	}, []);

	const handleReverseRightTouchStart = useCallback(() => {
		pushToStack(REVRIGHT);
	}, []);

	const handleReverseRightTouchEnd = useCallback(() => {
		popFromStack(REVRIGHT);
	}, []);

	const handleReverseFastTouchStart = useCallback(() => {
		pushToStack(REVFAST);
	}, []);

	const handleReverseFastTouchEnd = useCallback(() => {
		popFromStack(REVFAST);
	}, []);

	const handleNormalSong = useCallback(() => {
		sendNum(225);
	}, []);

	const handleAltSong = useCallback(() => {
		sendNum(226);
	}, []);

	useEffect(() => {
		// Transmit the command on top of the stack
		const cmd =
			commandStack.length > 0 ? commandStack[commandStack.length - 1] : STOP;
		sendNum(cmd);

		// Logging the updated stack
		// console.log("Updated command stack:", commandStack);
	}, [commandStack]);

	return (
		<div classname="full-contatiner">
			<div className="top-container">
				<div>
					<button onClick={startConnect}>Connect</button>
					<button onClick={disconnect}>disconnect</button>
				</div>
				<div>
					<button onClick={handleNormalSong}>Normal Song</button>
					<button onClick={handleAltSong}>Alt Song</button>
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
						onTouchStart={HandleForwardFastTouchStart}
						onTouchEnd={HandleForwardFastTouchEnd}
					>
						forward-fast
					</button>
					<button className="invisible"></button> {/* empty top-left */}
					<button
						className="movebutton"
						onTouchStart={HandleLeftTouchStart}
						onTouchEnd={HandleLeftTouchEnd}
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
						onTouchStart={HandleRightTouchStart}
						onTouchEnd={HandleRightTouchEnd}
					>
						right
					</button>
					<button className="invisible"></button>
					<button
						className="movebutton"
						onTouchStart={HandleReverseFastTouchStart}
						onTouchEnd={HandleReverseFastTouchEnd}
					>
						reverse-fast
					</button>
					<button className="invisible"></button>
				</div>

				<div className="dpadright">
					<button
						className="movebutton"
						onTouchStart={HandleForwardLeftTouchStart}
						onTouchEnd={HandleForwardLeftTouchEnd}
					>
						forward-left
					</button>
					<button
						className="movebutton"
						onTouchStart={HandleForwardRightTouchStart}
						onTouchEnd={HandleForwardRightTouchEnd}
					>
						forward-right
					</button>
					<button
						className="movebutton"
						onTouchStart={HandleReverseLeftTouchStart}
						onTouchEnd={HandleReverseLeftTouchEnd}
					>
						reverse-left
					</button>

					<button
						className="movebutton"
						onTouchStart={HandleReverseRightTouchStart}
						onTouchEnd={HandleReverseRightTouchEnd}
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
