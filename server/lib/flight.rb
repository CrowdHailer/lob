class Flight < Sequel::Model(:flights)
  plugin :timestamps, :create => :submitted_at
  def max_altitude=(meters)
    meters = meters.to_f
    raise ArgumentError, 'Maximum altitude must be greater than zero' if meters <= 0
    centimeters = (meters * 100).to_i
    super(centimeters)
  end

  def max_altitude
    super.to_f / 100
  end

  def username=(name)
    name = name.to_s
    raise ArgumentError, 'Username is invalid' if name == ''
    super(name)
  end
end
