const { GraphQLScalarType, Kind } = require('graphql');

const formatDateTime = (datetime) => {

  // prisma timezone issue로 인해 9시간 빼줌
  // (db에서 받아올때 timezone 000Z로 받아와서 getDate시 한국 표준시로 9시간 더해짐)
  datetime.setHours(datetime.getHours()-9);

  const year = datetime.getFullYear();
  const month = String(datetime.getMonth() + 1).padStart(2, '0');
  const day = String(datetime.getDate()).padStart(2, '0');
  const hours = String(datetime.getHours()).padStart(2, '0');
  const minutes = String(datetime.getMinutes()).padStart(2, '0');
  const seconds = String(datetime.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const DATE_TIME_FORMAT = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const validateDateTime = (value) => {
  const formattedDateTime = formatDateTime(value);
  const isValidFormat = DATE_TIME_FORMAT.test(formattedDateTime);
  if (!isValidFormat) {
    throw new Error('Input value is not in a valid format');
  }
  return formattedDateTime;
};

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime Type',
  serialize(value) {
    return validateDateTime(value);
  },
  parseValue(value) {
    return validateDateTime(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validateDateTime(ast.value);
    }
    return null;
  },
});

export default DateTimeScalar;