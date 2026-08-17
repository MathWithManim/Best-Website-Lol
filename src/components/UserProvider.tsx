import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const sessionToken = localStorage.getItem('sessionToken');
  const email = localStorage.getItem('userEmail');
  
  const user = useQuery(api.users.getUser, email && sessionToken ? { email, sessionToken } : "skip");
  
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
