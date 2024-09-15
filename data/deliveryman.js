import bcryptjs from "bcryptjs";

const deliveryManData = [
  {
    id: 1,
    name: "deliveryManOne",
    email: "deliveryManOne@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    isAvailable: true,
  },
  {
    id: 2,
    name: "deliveryManTwo",
    email: "deliveryManTwo@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    role: "sakib",
    isAdmin: false,
  },
  {
    id: 1,
    name: "user",
    email: "user@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    role: "user",
    isAdmin: false,
  },
];

export default deliveryManData;
