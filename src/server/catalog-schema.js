const { z } = require('zod');

const imageSchema = z.string().trim().min(1).max(400000).refine(
  value => /^https?:\/\/\S+$/i.test(value) || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value),
  'Недопустимый формат изображения'
);

const hotelSchema = z.object({
  name: z.string().trim().min(1).max(160),
  price: z.number().finite().positive().max(1000000000),
  image: imageSchema,
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  meal: z.string().trim().min(1).max(120),
  stars: z.number().int().min(3).max(5),
  beach: z.string().trim().max(160),
  description: z.string().trim().max(5000),
  gallery: z.array(imageSchema).max(20)
});

module.exports = { hotelSchema };
