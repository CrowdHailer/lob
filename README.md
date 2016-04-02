# lob
Demonstrating realtime connection between web browsers. Powered by ably.io

### Installation

Requires Ruby, RubyGems, Node.js and Npm to be installed.

Clone source from [github](https://github.com/CrowdHailer/lob)

```
git clone git@github.com:CrowdHailer/lob.git
cd lob
```

Fetch dependencies

```
bundle
npm install
```

Create database, requires postgres to be set up and user and passwords to be set.

```
createdb lob_development
rake db:migrate:up
```

### Usage

Run all the tests through rake and npm.

```
rake test && npm test
```

Run the local version by executing `heroku local`.
The application will the be available on port 5000

### Notes

- Use [Level Project](https://github.com/CrowdHailer/level) as demo for accessing acceleration data.
- Use [Chart JS](http://www.chartjs.org/) to plot the output data.
  - [Fiddle on updating points on chart-js](http://jsbin.com/yitep/4/edit?html,js,output)
  - [Fiddle on appending points to a chart-js line graph](http://jsfiddle.net/qs0gpLa2/)
