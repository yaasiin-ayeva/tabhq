import { getUserInfo } from "./localstorage";

export const displayName = () => {
    const user = getUserInfo();
    console.log("user", user);

    if (!user) return '';
    const full = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim();
    return full || user.email || '';
};

const getGreetingMessage = (name = displayName()) => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let greeting;

    if (currentHour >= 5 && currentHour < 12) {
        greeting = 'Good morning ';
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Good afternoon ';
    } else {
        greeting = 'Good evening ';
    }

    return `Hello ${name}, ${greeting}`;
};

export default getGreetingMessage;
