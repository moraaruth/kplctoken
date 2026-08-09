const user = { name: "Bob", age: 30, active: true };

// Convert object to JSON string
const json = JSON.stringify(user);
console.log("JSON String:", json);

// Convert JSON string back to object
const parsedUser = JSON.parse(json);
console.log("Parsed Object:", parsedUser);