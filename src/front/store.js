export const initialStore = () => {
  let token = null;
  let user = null;

  try {
    // Retrieve token and user info from sessionStorage on initial load
    token = sessionStorage.getItem("token");
    const userString = sessionStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    // If parsing fails, clear out the corrupted data
    console.error("Failed to parse user from sessionStorage", error);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    token = null;
    user = null;
  }

  return {
    token: token,
    user: user,
    message: "Hello from the store!",
    todos: []
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'login':
      const { token, user } = action.payload;
      // Store token and user info in sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      return {
        ...store,
        token: token,
        user: user
      };

    case 'logout':
      // Clear token and user info from sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null
      };

    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
      
    default:
      return store;
  }
}
