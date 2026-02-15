import API from "./api";

// 1. Get Untested Units (For Screening Tab)
export const getUntestedUnits = () => API.get("/lab/untested");

// 2. Get Safe Units (For Component Tab)
export const getSafeUnits = () => API.get("/lab/safe");

// 3. Update Results (THE FIX: Changed from '/test' to '/update-results')
export const updateTestResults = (data) => API.post("/lab/update-results", data);

// 4. Process Components
export const processComponents = (data) => API.post("/lab/process", data);