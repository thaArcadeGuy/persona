const axios = require("axios");
const Profile = require("../models/profile.model");

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
    const nameExists = await Profile.findOne({ name: name.toLowerCase() });
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
      min_country_probability
    } = req.query

    const filter = {};

    // Build equality filters
    if (gender) filter.gender = gender;
    if (age_group) filter.age_group = age_group;
    if (country_id) filter.country_id = country_id;

    // Build range filters
    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = parseInt(min_age);
      if (max_age) filter.age.$lte = parseInt(max_age)
    }

    if (min_gender_probability) {
      filter.gender_probability = {
        $gte: parseFloat(min_gender_probability)
      };
    }

    if (min_country_probability) {
      filter.country_probability = {
        $gte: parseFloat(min_country_probability)
      };
    }

    console.log("Filter object:", filter);

    const profiles = await Profile.find(filter)
      .collation({ locale: "en", strength: 2 })
      .select("id name gender age age_group country_id");
    res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles,
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
