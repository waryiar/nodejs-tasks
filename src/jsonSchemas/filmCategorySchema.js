const FilmCategorySchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      required: true,
      minLength: 3,
    },
    description: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 500,
    },
    films: {
      type: 'array',
      required: true,
      items: {
        type: 'string',
      },
    },
  },
};

export default FilmCategorySchema;
