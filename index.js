const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },]

/*for (let i = 0; i <users.length; i++){
    const user = users[i];
    user.age = user.age + 1;
}
console.log(users);
let i = 0;
while (i < users.length) {
    const user = users[i];
    user.age = user.age + 1;
    i++;
}
console.log(users);*/
let i = 0;
do {
    const user = users[i];
    user.age = user.age + 1;
    i++;
}while (i < users.length);
console.log(users);