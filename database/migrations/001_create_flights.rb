Sequel.migration do
  up do

    create_table(:flights) do
      primary_key :id
      String :username, :null => false
      Integer :max_altitude, :null => false
      DateTime :submitted_at, :null => false
    end
  end

  down do
    drop_table(:flights)
  end
end
