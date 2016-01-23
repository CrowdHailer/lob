# Setup rack enviroment to test unless specified
RACK_ENV = ENV['RACK_ENV'] = 'test' unless defined?(RACK_ENV)

require 'rubygems' unless defined?(Gem)
require 'bundler/setup'
Bundler.require(:default, RACK_ENV)

reporter_options = {color: true, slow_count: 5}
Minitest::Reporters.use! [Minitest::Reporters::DefaultReporter.new(reporter_options)]
