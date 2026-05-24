import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import PostCard from "./PostCard";
import { getUsers, getPost } from "./Services";
import { use } from "react";

function Exercise() {
  const [users, setUsers] = useState([]);

  // console.log(getUsers());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("[Component] Gagal menampilkan data:", error.message);
      }
    };
    fetchData();
  }, []);

  // filter untuk User non Semarang
  // const nonSemarangUsers = users.filter((user) => user.city !== "Semarang");

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-red-700">
          Post Cards
        </h1>
        <div className="grid md:grid-cols-6 lg:grid-cols-6 gap-4 max-w-[90%] mx-auto">
          {getPost.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Exercise;
