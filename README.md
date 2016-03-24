# lob
Demonstrating realtime connection between web browsers. Powered by [Ably, simply better realtime messaging](https://www.ably.io)

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

Create dev db `lob_development`
Run migrations `sequel -m database/migrations postgres://localhost/lob_development`
Run the local version by executing `heroku local`.
The application will the be available on port 5000

Compiling assets relies on `npm`.

Pre-requisites:
* `npm install` to set up dependencies
* `git submodule init && git submodule update`

Then build your assets:
`npm build` to build and copy assets
