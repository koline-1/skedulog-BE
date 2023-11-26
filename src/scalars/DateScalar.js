const { GraphQLScalarType, Kind } = require('graphql');

const formatDate = (date) => {

    const tmpDate = new Date(date);
    const year = tmpDate.getFullYear();
    const month = String(tmpDate.getMonth() + 1).padStart(2, '0');
    const day = String(tmpDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const validateDate = (value) => {
  const formattedDate = formatDate(value);
  const isValidFormat = DATE_FORMAT.test(formattedDate);
  if (!isValidFormat) {
    throw new Error('Input value is not in a valid format');
  }
  return formattedDate;
};

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date Type',
  serialize(value) {
    return validateDate(value);
  },
  parseValue(value) {
    return validateDate(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validateDate(ast.value);
    }
    return null;
  },
});

export default DateScalar;