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
    const nameExists = await Profile.findOne({ name: name.toLowerCase() });
    if (nameExists) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: nameExists,
      });
    }

    console.log("4. Starting API calls...");
    const genderizeApiCall = fetch(`https://api.genderize.io?name=${name}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Genderize failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.gender === null || data.count === 0) {
          throw new Error("Genderize returned an invalid response");
        }
        return data;
      });

    const agifyApiCall = fetch(`https://api.agify.io?name=${name}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Agify failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.age === null) {
          throw new Error("Agify returned an invalid response");
        }
        return data;
      });

    const nationalizeApiCall = fetch(`https://api.nationalize.io?name=${name}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Nationalize failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.country || data.country.length === 0) {
          throw new Error("Nationalize returned an invalid response");
        }
        return data;
      });

    const apiCalls = [genderizeApiCall, agifyApiCall, nationalizeApiCall];

    console.log("5. Waiting for Promise.allSettled...");
    const responses = await Promise.allSettled(apiCalls);
    console.log(
      "6. AllSettled complete. Responses:",
      responses.map((r) => r.status),
    );

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

    console.log("Successful responses:", successData);
    console.error("Errors:", errors);

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
    console.error("CATCH BLOCK ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create profile",
    });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params

    const profile = await Profile.findOne({_id: id})
    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      })
    }

    res.status(200).json({
      status: "success",
      data: profile
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get profile"
    })
  }
}

exports.getAllProfiles = async (req, res) => {
  try {
    const filter = { ...req.query }
    const profiles = await Profile.find(filter)
      .collation({ locale: "en", strength: 2 })
      .select("id name gender age age_group country_id")
    res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get all profiles"
    })
  }
}

exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({_id: req.params.id})

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      })
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete profile"
    })
  }
}
