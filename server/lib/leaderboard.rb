class Flight < Sequel::Model(:flights)
  plugin :timestamps, :create => :submitted_at
  def max_altitude=(meters)
    centimeters = (meters.to_f*100).to_i
    super(centimeters)
  end

  def max_altitude
    super.to_f / 100
  end
end

class Leaderboard
  def self.best_today(limit: 100)
    Flight
      .where{submitted_at > (Time.now - 86400)}
      .order(:max_altitude)
      .reverse
      .limit(limit)
      .all
  end

  def self.best_this_week(limit: 100)
    Flight
      .where{submitted_at > (Time.now - 7 * 86400)}
      .order(:max_altitude)
      .reverse
      .limit(limit)
      .all
  end

  def self.best_this_month(limit: 100)
    Flight
      .where{submitted_at > (Time.now - 30 * 86400)}
      .order(:max_altitude)
      .reverse
      .limit(limit)
      .all
  end

  def self.submit_flight(flight)
    flight.save
  end
end
