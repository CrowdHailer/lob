require_relative './test_config'

require_relative '../lib/flight'

class FlightTest < MiniTest::Test
  def run(*args, &block)
    Sequel::Model.db.transaction(:rollback=>:always, :auto_savepoint=>true){super}
  end

  def test_valid_flight_has_username_and_max_altitude
    flight = Flight.new(username: 'bob', max_altitude: 25)
    assert_equal flight.username, 'bob'
    assert_equal flight.max_altitude, 25
  end

  def test_a_max_altitude_of_zero_is_invalid
    assert_raises ArgumentError do
      flight = Flight.new(username: 'bob', max_altitude: 0)
    end
  end

  def test_a_blank_username_is_invalid
    assert_raises ArgumentError do
      flight = Flight.new(username: '', max_altitude: 9)
    end
  end
end
