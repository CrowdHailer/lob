begin
  if require 'dotenv'
    puts "Loading .env key=value pairs if present"
    Dotenv.load
  end
rescue LoadError
  # Just don't load it if it's not included in this gemset
end

# setup as development enviroment unless otherwise specified
RACK_ENV = ENV['RACK_ENV'] ||= 'development' unless defined?(RACK_ENV)

require 'sequel'
# Thread safe loading?
require 'tilt/erb'

DATABASE_URL = ENV.fetch('DATABASE_URL') { "postgres://localhost/lob_#{RACK_ENV}" }

Sequel::Model.plugin(:schema)
DB = Sequel.connect(DATABASE_URL)
