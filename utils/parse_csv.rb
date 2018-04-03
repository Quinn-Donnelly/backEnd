require 'csv'

filename = ARGV[0]
output_type = ARGV[1]
types = ['JSON', 'SQL', 'UML', 'TESTDATA']

join_string = ["\n", ',', "\n", ",\n"]
current_type = "SQL"
types.each_with_index {|type, index| current_type = index if output_type == type}
counter = 0

headers = []
fields = []
combined = []

def get_type(string)
  return "bool" if string == "FALSE" or string == "TRUE"
  return "null" if string == "NA" or string == "null" or string == "\\N"
  return "integer" if string =~ /\A[-+]?\d+\z/
  return "float" if string =~ /^[-+]?[0-9]*\.?[0-9]*$/
  return "string"
end

CSV.foreach(filename) do |row|
  row_index = 0
  if output_type == 'TESTDATA'
    row.each do |item|
      headers.push item if counter == 0
      if counter > 0
        item = 'null' if item == '\N'
        fields.push item
      end
    end
    counter += 1
    break if counter > 5;
  else
    row.each do |item|
      headers.push item if counter == 0
      type = get_type(item)
      fields.push type if counter == 1
      if counter > 1
        type = get_type(item) if fields[row_index] == "null"
        fields[row_index] = type if type != "null"
      end
      row_index += 1
    end
    counter += 1
  end
end

if output_type != "TESTDATA"
  fields.each_with_index do |field, index|
    fields[index] = "string" if field == "null" 
  end
end

fields.each_with_index do |field, index|
  if output_type == 'JSON'
    field = 'number' if field == 'integer' or field == 'float'
    field = 'text' if field == 'string'
    field = 'checkbox' if field == 'bool'
  end
  label = headers[index % headers.size].split('_').each(&:capitalize!).join(' ')
  format_strings =["{ type: '#{field}', label: '#{label}' name:'#{headers[index]}' },", "#{headers[index]}:#{field}", "+ #{headers[index]}:#{field}", "#{index % headers.size == 0 ? "\t{\n" : ""}\t\t#{headers[index % headers.size]}: #{field}#{index % headers.size == headers.size - 1 ? ",\n\t}" : ""}"]
  combined.push format_strings[current_type]
end

combined_string = combined.join(join_string[current_type])

combined_string += ",\n];" if output_type == "TESTDATA"
combined_string = "[\n" + combined_string if output_type == "TESTDATA"

File.open("#{File.dirname(filename)}/#{File.basename(filename, ".csv")}.#{types[current_type].downcase}", 'w') do |file|
  file.write(combined_string)
end
