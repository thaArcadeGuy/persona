const Profile = require("../models/profile.model")

async function parseNLQ(queryText) {
  const filter = {};

  const queryString = queryText.toLowerCase();

  const hasMale = queryString.includes("male") || queryString.includes("males") || queryString.includes("man") || queryString.includes("men")

  const hasFemale = queryString.includes("female") || queryString.includes("females") || queryString.includes("woman") || queryString.includes("women")

  if (hasMale && hasFemale) {
    // Don't filter by gender at all
  } else if (hasMale) {
    filter.gender = "male";
  } else if (hasFemale) {
    filter.gender = "female"
  }

  if (queryString.includes("young")) {
    filter.age = { 
      $lte: 24,
      $gte: 16
     }
  }

  if (queryString.includes("child") || queryString.includes("children")) {
    filter.age_group = "child"
  }

  if (queryString.includes("teenager") || queryString.includes("teenagers") || queryString.includes("teen") || queryString.includes("teens")) {
    filter.age_group = "teenager"
  }

  if (queryString.includes("adult") || queryString.includes("adults")) {
    filter.age_group = "adult"
  }

  if (queryString.includes("senior") || queryString.includes("seniors")) {
    filter.age_group = "senior"
  }

  const countryMapping = await Profile.aggregate([
    { $match: { country_name: { $ne: null } } },
    { $group: { _id: { name: "$country_name", id: "$country_id" } } },
    { $replaceRoot: { newRoot: "$_id" } }
  ])

  countryMapping.sort((a, b) => b.name.length - a.name.length);

  for (const country of countryMapping) {
    if (country.name && queryString.includes(country.name.toLowerCase())) {
      filter.country_id = country.id
      break
    }
  }

  const minMatch = queryString.match(/(above|over|greater than)\s+(\d+)/)
  if (minMatch) {
    filter.age = { ...filter.age, $gte: parseInt(minMatch[2]) }
  }

  const maxMatch = queryString.match(/(below|under|less than)\s+(\d+)/);
  if (maxMatch) {
    filter.age = { ...filter.age, $lte: parseInt(maxMatch[2]) };
  }

  const betweenMatch = queryString.match(/between\s+(\d+)\s+and\s+(\d+)/);
  if (betweenMatch) {
    filter.age = {
      $gte: parseInt(betweenMatch[1]),
      $lte: parseInt(betweenMatch[2])
    };
  }
  return filter;
}

module.exports = parseNLQ;