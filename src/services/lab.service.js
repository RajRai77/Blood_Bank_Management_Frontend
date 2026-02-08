import API from "./api";

// 1. Fetch Units Pending Testing
export const getUntestedUnits = () => API.get("/inventory?isTested=false");

// 2. Fetch Safe Whole Blood (Ready for Separation)
export const getSafeUnits = () => API.get("/inventory?status=available&inventoryType=Whole Blood&isTested=true&testResult=Safe");

// 3. Submit Test Results (The Toggles)
export const updateTestResults = (data) => API.put("/lab/test", data);

// 4. Split Blood (The Centrifuge)
export const processComponents = (data) => API.post("/lab/process", data);