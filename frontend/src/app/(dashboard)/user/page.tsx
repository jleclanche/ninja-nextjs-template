import { fetchUser } from "@/api/server-api";

const UserInfoPage = async () => {
    const user = await fetchUser();
    return (
        <div>
            <h1>User</h1>
            <p>Name: {user.full_name}</p>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default UserInfoPage;
