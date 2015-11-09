# lob
Demonstrating realtime connection between web browsers. Powered by ably.io

You are given 20 seconds of recording on the device. A 10 second freefall has been thrown to [123m](http://www.physicsclassroom.com/class/1DKin/Lesson-5/How-Fast-and-How-Far).

## Plan

These are the steps that make the current development plan for lob.

#### Version 1 (proof of concept)
- Read acceleration data from device hardware
- Send data over ably channel
- Display data on tracking chart

- Use [Level Project](https://github.com/CrowdHailer/level) as demo for accessing acceleration data.
- Use [Chart JS](http://www.chartjs.org/) to plot the output data.
  - [Fiddle on updating points on chart-js](http://jsbin.com/yitep/4/edit?html,js,output)
  - [Fiddle on appending points to a chart-js line graph](http://jsfiddle.net/qs0gpLa2/)

#### Version 1b (freefall algorithim)
- Workout what the acceleration magnitude threshold is for freefall.
- Freefall time counter.
- Record time calculate height?
- Auto stop of recording after freefall window.

#### Version 2 (multiple users)
- Setup channel name
- Fetch token from ably which requires sinatra app

#### Version 3 (identify users)
- Record user identity
- Record throw information
- Keep score board

#### Version Speculative (record images)
This step requires different page permissions.
The API for camera access will require work to achieve the same cross platform support as available for accelerometer.

- Record pictures along the way.
- Save top picture along with chart data.
