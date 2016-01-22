DATABASE_URL = ENV.fetch('DATABASE_URL'){
  "postgres://localhost/useful_music_#{RACK_ENV}"
}

Sequel::Model.plugin(:schema)
DB = Sequel.connect(DATABASE_URL)
