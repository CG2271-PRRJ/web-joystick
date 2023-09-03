import sys
from PyQt5.QtWidgets import QWidget, QApplication, QLabel, QVBoxLayout
from PyQt5.QtGui import QPainter, QPen, QColor, QFont
from PyQt5.QtCore import Qt, QPoint, pyqtSignal
import math

class JoystickWidget(QWidget):
    signal_position = pyqtSignal(float, float)
    signal_motors = pyqtSignal(float, float, float)

    def __init__(self):
        super().__init__()
        self.setFixedSize(200, 200)  # Increased size
        self.center = QPoint(self.width() // 2, self.height() // 2)
        self.joystick_position = self.center
        self.is_pressed = False
        self.pen_width = 5  # Circle stroke width
        self.joystick_radius = 25

    def paintEvent(self, event):
        qp = QPainter(self)
        qp.setPen(QPen(Qt.black, self.pen_width))  # Set pen width
        qp.setBrush(QColor(200, 200, 200))
        qp.drawEllipse(self.pen_width // 2, self.pen_width // 2,
                       self.width() - self.pen_width, self.height() - self.pen_width)
        qp.setBrush(QColor(150, 150, 150))
        qp.drawEllipse(self.joystick_position.x() - self.joystick_radius,
                       self.joystick_position.y() - self.joystick_radius,
                       2 * self.joystick_radius, 2 * self.joystick_radius)
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.is_pressed = True
            self.set_joystick_position(event.pos())
            self.update()
            self.report_position()

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.is_pressed = False
            self.joystick_position = self.center
            self.update()
            self.report_position()

    def mouseMoveEvent(self, event):
        if self.is_pressed:
            self.set_joystick_position(event.pos())
            self.update()
            self.report_position()

    def set_joystick_position(self, position):
        dx = position.x() - self.center.x()
        dy = position.y() - self.center.y()
        distance = (dx**2 + dy**2)**0.5  # Compute the Euclidean distance

        max_distance = (self.width() // 2) - self.pen_width  # Adjusted max_distance
        if distance > max_distance:
            # Normalize the direction and scale by max_distance
            scale = max_distance / distance
            dx *= scale
            dy *= scale
            self.joystick_position = QPoint(int(round(self.center.x() + dx)), int(round(self.center.y() + dy)))
        else:
            self.joystick_position = position

    
    def report_position(self):
        x = self.joystick_position.x() - self.center.x()
        y = self.center.y() - self.joystick_position.y()
        self.signal_position.emit(x / 100.0, y / 100.0)
        self.report_motors(x, y)
    
    def report_motors(self, x, y):
        #first Compute the angle in deg
        #First hypotenuse
        h = (x**2 + y**2)**0.5
        if h == 0:
            rad = 0
            angle = 0
        else:    
            #Then angle in radians
            rad = math.acos(abs(x)/h)
            
            #Then angle in degrees
            angle = math.degrees(rad)
        
        
        mov = max(abs(x), abs(y))
        
        # Adjust for 10-degree tolerance around major axes
        if 0 <= angle < 3 or abs(y) < 0.1:
            angle = 0
        elif 87 < angle <= 90 or abs(x) < 0.1:
            angle = 90
        
        tcoeff = -1 + (angle / 90) * 2
        if tcoeff == -1:
            turn = -mov
        elif tcoeff == 1:
            turn = mov
        else:
            turn = tcoeff * abs(abs(x) - abs(y))
            turn = round(turn * 100) / 100
        
       
        
        ## first and third quadrant
        if (x >= 0 and y >= 0) or (x < 0 and y < 0):
            motor1 = mov
            motor2 = turn
        else:
            motor1 = turn
            motor2 = mov
        
        # reverse polarity
        if y < 0:
            motor1 = -motor1
            motor2 = -motor2
        
        motor1 = round(motor1 / 100 * 7) + 7
        motor2 = round(motor2 / 100 * 7) + 7
        
        bignum = motor1 * 15 + motor2
        
        motor1 = bignum // 15
        motor2 = bignum % 15
        
        self.signal_motors.emit(motor1, motor2, bignum)
        
        
#when our joystick app is stop, dont send anything
#joystick, spam mqtt info

#esp32, receive mqtt, ignore for 25ms
#esp32, when getting command, movement to robot, timeout 50ms, stop



# 7, 100
# 6, 90
# 5, 80
# 4, 65
# 3, 50
# 2, 30
# 1, 10

        
# 0 - 224

# any number after 225 is other commands

# stop == 112
# start == any value between 0-224 excluding 112

# LEDG,  stop == static, check for stop first,  start == running
# LEDR,  stop == blink slow, check for stop first, start == blink fast

# play song 1, by default it will play song 1, 225
# play song 2, 226
# stop song, 227

class JoystickDemo(QWidget):
    def __init__(self):
        super().__init__()

        layout = QVBoxLayout()
        self.joystick = JoystickWidget()
        self.coordinates_label = QLabel("x: 0, y: 0")
        self.motor_label = QLabel("motor1: 0, motor2: 0, big num: 0")
        
        # change font size
        font = QFont()
        font.setPointSize(20)
        self.coordinates_label.setFont(font)
        self.motor_label.setFont(font)
        
        layout.addWidget(self.joystick)
        layout.addWidget(self.coordinates_label)
        layout.addWidget(self.motor_label)
        self.setLayout(layout)
        
        self.joystick.signal_position.connect(self.update_coordinates)
        self.joystick.signal_motors.connect(self.update_motors)

    def update_coordinates(self, x, y):
        self.coordinates_label.setText(f"x: {x}, y: {y}")
    
    def update_motors(self, x, y, z):
        self.motor_label.setText(f"motor1: {x}, motor2: {y}, big num: {z}")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    demo = JoystickDemo()
    demo.show()
    sys.exit(app.exec_())
