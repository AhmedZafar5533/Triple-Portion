const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');
const electronicsSchema = require('./electronicsSchema');
const accommodationSchema = require('./accommodationSchema');
const tourSchema = require('./tourSchema');
const grocerySchema = require('./grocerySchema');
const buildingMaterialSchema = require('./buildingMaterialSchema');

const validateProduct = (data) => {
  const category = data.category;
  
  // Parse fields that might be sent as JSON strings via FormData
  const fieldsToParse = ['tags', 'specifications', 'features', 'dietaryInfo', 'nutritionalInfo', 'itinerary', 'included', 'warranty', 'availableDates'];
  const parsedData = { ...data };
  
  fieldsToParse.forEach(field => {
    if (parsedData[field] && typeof parsedData[field] === 'string') {
      try {
        parsedData[field] = JSON.parse(parsedData[field]);
      } catch (e) {
        // If it's not valid JSON, leave it as is (let Joi handle validation)
      }
    }
  });

  if (category === 'Electronics' || category === 'Home Appliances') {
    return electronicsSchema.validate(parsedData, { abortEarly: false, allowUnknown: true });
  } else if (category === 'Accommodation') {
    return accommodationSchema.validate(parsedData, { abortEarly: false, allowUnknown: true });
  } else if (category === 'Tour') {
    return tourSchema.validate(parsedData, { abortEarly: false, allowUnknown: true });
  } else if (category === 'Grocery') {
    return grocerySchema.validate(parsedData, { abortEarly: false, allowUnknown: true });
  } else if (category === 'Building Material / Plumbing') {
    return buildingMaterialSchema.validate(parsedData, { abortEarly: false, allowUnknown: true });
  }
  
  return Joi.object(productBaseSchema).validate(parsedData, { abortEarly: false, allowUnknown: true });
};

module.exports = {
  validateProduct
};

