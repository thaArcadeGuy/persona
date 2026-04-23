const axios = require("axios");
const Profile = require("../models/profile.model");
const parseNLQ = require("../utils/queryParser")

exports.createProfile = async (req, res) => {
  try {
    const { name } = req.body;
     console.log("1. Name received:", name);

    if (name !== undefined && name !== null && typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Unprocessable Entity",
      });
    }

    if (!name || name === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name",
      });
    }

     console.log("2. Checking if name exists in DB...");
    //TODO:  remove .toLowerCase()
    const nameExists = await Profile.findOne({ name: name });
    console.log("3. DB check complete. Exists?", !!nameExists);
    if (nameExists) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: nameExists,
      });
    }

    const genderizeApiCall = axios
      .get(`https://api.genderize.io?name=${name}`)
      .then((response) => response.data)
      .then((data) => {
        if (data.gender === null || data.count === 0) {
          throw new Error("Genderize returned an invalid response");
        }
        return data;
      })
      .catch((err) => {
        const status = err.response?.status || "Network Error";
        throw new Error(`Genderize failed: ${status}`);
      });

    const agifyApiCall = axios
      .get(`https://api.agify.io?name=${name}`)
      .then((response) => response.data)
      .then((data) => {
        if (data.age === null) {
          throw new Error("Agify returned an invalid response");
        }
        return data;
      })
      .catch((err) => {
        throw new Error(
          `Agify failed: ${err.response?.status || "Network Error"}`,
        );
      });

    const nationalizeApiCall = axios
      .get(`https://api.nationalize.io?name=${name}`)
      .then((response) => response.data)
      .then((data) => {
        if (!data.country || data.country.length === 0) {
          throw new Error("Nationalize returned an invalid response");
        }
        return data;
      })
      .catch((err) => {
        throw new Error(
          `Nationalize failed: ${err.response?.status || "Network Error"}`,
        );
      });

      console.log("4. Starting API calls...");
    const apiCalls = [genderizeApiCall, agifyApiCall, nationalizeApiCall];
     

    console.log("5. Waiting for Promise.allSettled...");
    const responses = await Promise.allSettled(apiCalls);
    console.log("6. AllSettled complete. Responses:", responses.map(r => r.status));

    const errors = responses
      .filter((res) => res.status === "rejected")
      .map((error) => error.reason);

    if (errors.length > 0) {
      const errorMessage = errors[0].message;
      const externalApi = errorMessage.includes("Genderize")
        ? "Genderize"
        : errorMessage.includes("Agify")
          ? "Agify"
          : "Nationalize";

      return res.status(502).json({
        status: "502",
        message: `${externalApi} returned an invalid response`,
      });
    }

    const successData = responses
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);

    const profileData = {
      name: name.toLowerCase(),
    };

    const genderizeData = successData.find((d) => "gender" in d);
    const agifyData = successData.find((d) => "age" in d);
    const nationalizeData = successData.find((d) => "country" in d);

    if (genderizeData) {
      profileData.gender = genderizeData.gender;
      profileData.gender_probability = genderizeData.probability;
      profileData.sample_size = genderizeData.count;
    }

    if (agifyData) {
      profileData.age = agifyData.age;
      profileData.age_group =
        agifyData.age <= 12
          ? "child"
          : agifyData.age <= 19
            ? "teenager"
            : agifyData.age <= 59
              ? "adult"
              : "senior";
    }

    if (nationalizeData) {
      const topCountry = nationalizeData.country.reduce((max, curr) =>
        curr.probability > max.probability ? curr : max,
      );
      profileData.country_id = topCountry.country_id;
      profileData.country_probability = topCountry.probability;
    }

    const newProfile = await Profile.create(profileData);

    res.status(201).json({
      status: "success",
      data: newProfile,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("ERROR STACK:", error.stack);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get all profiles"
    });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ _id: id });
    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get profile",
    });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query

    const filter = {};

    // Build equality filters
    if (gender) {
      const allowedGender = ["male", "female"]
      if (!allowedGender.includes(gender.toLowerCase())) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        })
      }
      filter.gender = gender.toLowerCase();
    };

    if (age_group) {
      const allowedAgeGroup = ["child", "teenager", "adult", "senior"]
      if (!allowedAgeGroup.includes(age_group.toLowerCase())) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        })
      }
      filter.age_group = age_group.toLowerCase();
    };
    if (country_id) filter.country_id = country_id;

    // Build range filters
    if (min_age || max_age) {
      const parsedMin = min_age ? parseInt(min_age) : undefined;
      const parsedMax = max_age ? parseInt(max_age) : undefined;

      // Validate numbers first
      if (min_age && isNaN(parsedMin)) {
        return res.status(422).json({
          status: "error",
          message: "min_age must be a number"
        });
      }

      if (max_age && isNaN(parsedMax)) {
        return res.status(422).json({
          status: "error",
          message: "max_age must be a number"
        });
      }

      // Then validate relationship
      if ( parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
        return res.status(422).json({
          status: "error",
          message: "min_age cannot be greater than max_age"
        })
      }

      filter.age = {};
      if (parsedMin) filter.age.$gte = parsedMin;
      if (parsedMax) filter.age.$lte = parsedMax;
    }

    if (min_gender_probability) {
      if (min_gender_probability < 0 || min_gender_probability > 1 || isNaN(parseFloat(min_gender_probability))) {
        return res.status(422).json({
          status: "error",
          message: "Probabilities should be numbers between 0 and 1"
        })
      }
      filter.gender_probability = {
        $gte: parseFloat(min_gender_probability)
      };
    }

    if (min_country_probability) {
      if (min_country_probability < 0 || min_country_probability > 1 || isNaN(parseFloat(min_country_probability))) {
        return res.status(422).json({
          status: "error",
          message: "Probabilities should be numbers between 0 and 1"
        })
      }
      filter.country_probability = {
        $gte: parseFloat(min_country_probability)
      };
    }

    // Build sort object
    const validSortFields = ["age", "created_at", "gender_probability"]
    const sortField = validSortFields.includes(sort_by) ? sort_by : "created_at"
    const sort = { [sortField]: order === "desc" ? -1 : 1, _id: 1 }

    // Validate pagination params
    const pageNum = Math.max(1, Number.parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit) || 10))

    console.log("Filter object:", filter);

    const profiles = await Profile.find(filter)
      .collation({ locale: "en", strength: 2 })
      .sort(sort)
      .limit(limitNum)
      .skip((pageNum -1) * limitNum);

    const total = await Profile.countDocuments(filter)
      .collation({ locale: "en", strength: 2 })
    
    res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      data: profiles
    });
  } catch (error) {
    console.error("GET ALL PROFILES ERROR NAME:", error.name);
    console.error("GET ALL PROFILES ERROR MESSAGE:", error.message);
    console.error("GET ALL PROFILES ERROR STACK:", error.stack);
    res.status(500).json({
      status: "error",
      message: "Failed to get all profiles",
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ _id: req.params.id });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete profile",
    });
  }
};

exports.searchProfiles = async (req, res) => {
  try {
    const { 
      q, 
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10 
    } = req.query;

    console.log("1. Query received:", q);

    if (typeof q !== "string") {
      return res.status(422).json({ 
        status: "error", 
        message: "Unable to interpret query" 
      })
    }

    if (!q || q === "") {
      return res.status(400).json({
        status: "error", 
        message: "Invalid query parameters"
      })
    }

    const filter = await parseNLQ(q);

    if (Object.keys(filter).length === 0) {
      return res.status(422).json({ 
        status: "error", 
        message: "Unable to interpret query" 
      })
    }

     // Build sort object
    const validSortFields = ["age", "created_at", "gender_probability"]
    const sortField = validSortFields.includes(sort_by) ? sort_by : "created_at"
    const sort = { [sortField]: order === "desc" ? -1 : 1 }

    // Validate pagination params
    const pageNum = Math.max(1, Number.parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit) || 10))

    const profiles = await Profile.find(filter)
      .collation({ locale: "en", strength: 2 })
      .sort(sort)
      .limit(limitNum)
      .skip((pageNum -1) * limitNum);

    const total = await Profile.countDocuments(filter)
      .collation({ locale: "en", strength: 2 })

    res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      data: profiles
    })

  } catch (error) {
    console.error("SEARCH ERROR:", error.message);
    console.error("SEARCH STACK:", error.stack);
    res.status(500).json({
      status: "error",
      message: "Failed to search profiles"
    })
  }
}
