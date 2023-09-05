import './App.css';
import { Joystick } from 'react-joystick-component';
import { useState,useEffect, useRef } from 'react';
import Paho from 'paho-mqtt';


function App() {    
    // initiate useState for X, Y, and a key for the joystick
    const [x_val, setX] = useState(0);
    const [y_val, setY] = useState(0);
    const [bignum, setBignum] = useState(112);
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);


    function startConnect(){
      let clientID = "clientID - "+parseInt(Math.random() * 100);
      let host = "192.168.2.37"; 
      let port = 9001;    
      var newcli = new Paho.Client(host,Number(port),clientID);
      newcli.onConnectionLost = onConnectionLost;
      newcli.connect({
          onSuccess: onConnect,
      });
      setClient(newcli);
    }

    function onConnect(responseObject){
      console.log("Connected!");
      setIsConnected(true);
    }

    function onConnectionLost(responseObject){
        console.log("Connection Lost: "+responseObject.errorMessage);
        setIsConnected(false);
    }

    function disconnect(){
      if (client !== null && client.isConnected()) {
          client.disconnect();
          setClient(null);
          setIsConnected(false);
      }
    }


    function myFunction() {
    //   if (bignum === 112){return;}
        
      // console.log("BIGNUM: " + bignum);
      if (client !== null && client.isConnected()) {
          let message = new Paho.Message(bignum.toString());
          message.destinationName = "joystick/value";
          client.send(message);
      }
      // Removed the clearInterval line
    }

    useEffect(() => {
      const intervalID = setInterval(myFunction, 10); // Call every 1 second

      // Clean up the interval on component unmount
      return () => {
          clearInterval(intervalID);
      }
    }, [bignum]); // Depend on bignum and client so the effect reruns when they change

    function handleMove(event) {
      // console.log(event);
      let xcoord = event.x * 100;
      let ycoord = event.y * 100;
      // console.log("X: " + xcoord);
      // console.log("Y: " + ycoord);
      
      let h = Math.sqrt(Math.pow(xcoord, 2) + Math.pow(ycoord, 2));
      let rad, angle, mov, tcoeff, turn, motor1, motor2, bignum;

      if (h === 0) {
          rad = 0;
          angle = 0;
      } else {
          // Angle in radians
          rad = Math.acos(Math.abs(xcoord) / h);

          // Angle in degrees
          angle = rad * (180 / Math.PI);
      }

      mov = Math.max(Math.abs(xcoord), Math.abs(ycoord));

      // Adjust for 10-degree tolerance around major axes
      if (((0 <= angle && angle < 5)) || Math.abs(ycoord) < 10) {
          angle = 0;
      } else if ((85 < angle && angle <= 90) || Math.abs(xcoord) < 10) {
          angle = 90;
      }

      tcoeff = -1 + (angle / 90) * 2;
      const TURN_DAMPENER_main = 0.5
      const TURN_DAMPENER_alt = 0.5
      if (tcoeff === -1) {
          turn = -mov;
      } else if (tcoeff === 1) {
          turn = mov;
      } else {
          turn = tcoeff * Math.abs(Math.abs(xcoord) - Math.abs(ycoord));
          turn = Math.round(turn * 100) / 100;
      }

      // First and third quadrant
      if ((xcoord >= 0 && ycoord >= 0) || (xcoord < 0 && ycoord < 0)) {
          motor1 = mov;
          motor2 = turn;
      } else {
          motor1 = turn;
          motor2 = mov;
      }

      if (angle < 85) {
            motor1 = motor1 * TURN_DAMPENER_main;
            motor2 = motor2 * TURN_DAMPENER_main;
      }

      // Reverse polarity
      if (ycoord < 0) {
        let temp = motor1;
          motor1 = -motor2;
          motor2 = -temp;
      }

      motor1 = Math.round(motor1 / 100 * 7) + 7;
      motor2 = Math.round(motor2 / 100 * 7) + 7;

      let number = motor1 * 15 + motor2;

      // motor1 = Math.floor(bignum / 15);
      // motor2 = bignum % 15;

      setBignum(number);
    }

    const handleStop = (event) => {
        setX(0);
        setY(0);
        console.log("STOPPED");
        console.log(event)
        setBignum(112);
        // Reset the joystick by changing its key, which will force a re-render
        // setJoystickKey(Math.random());
    }

    return (
      <>
        <button onClick={startConnect}>Connect</button>
        <button onClick={() => setBignum(112)}>Stop</button>
        <button onClick={disconnect}>disconnect</button>
        <p>
            Connected: 
            <span style={{ color: isConnected ? "green" : "red",
            fontWeight: "bold",
            fontSize: "1.2em"
            
            }}>
                {isConnected ? "true" : "false"}
            </span>
        </p>
        <div className="joystick_div">
            <Joystick 
                size={300} 
                stickSize={100} 
                sticky={false} 
                baseColor="lightgrey" 
                stickColor="black" 
                move={handleMove} 
                stop={handleStop} 
                pos={{x: x_val, y: y_val}} 
            />
        </div>
        </>
    );
}

export default App;
