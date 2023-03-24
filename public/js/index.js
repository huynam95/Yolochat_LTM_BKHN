const url = '/login';

const loginValidate = async function () {
  try {
    const config = {
      method: 'POST',

      body: JSON.stringify({
        username: 'huydnam1932d9sd5',
        password: '123456',
      }),
    };

    const response = await fetch('/login', config);

    return response;
  } catch (error) {
    console.log(error);
  }
};

const res = loginValidate();
console.log(res);
