import bcryptjs from "bcryptjs";

const deliveryManData = [
  {
    id: 1,
    name: "deliveryManOne",
    email: "deliveryManOne@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    isAvailable: true,
    phone: "014999999999",
  },
  {
    id: 2,
    name: "deliveryManTwo",
    email: "deliveryManTwo@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    phone: "019999999999",
    isAvailable: true,
  },
  {
    id: 3,
    name: "user",
    email: "user@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    phone: "01899999999",
    isAvailable: true,
  },
  {
    id: 4,
    name: "deliveryManThree",
    email: "deliveryManThree@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    phone: "01899999999",
    isAvailable: true,
  },
  {
    id: 5,
    name: "deliveryManFour",
    email: "deliveryManFour@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    phone: "01899999999",
    isAvailable: true,
  },
  {
    id: 6,
    name: "deliveryManFive",
    email: "deliveryManFive@gmail.com",
    password: bcryptjs.hashSync("123456", 8),
    phone: "01899999999",
    isAvailable: true,
  },
];

export default deliveryManData;
