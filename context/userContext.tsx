import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
    userId: string;
    name: string;
    email: string;
    role: string;
    address: string;
    phone: string;
    imagemPerfil?: string;
    imagemCapa?: string;
    about?: string;
    brand?: string;
};

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
};

type UserProviderProps = {
    children: ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserState(JSON.parse(storedUser));
        }
    }, []);

    const setUser = (user: User | null) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
        setUserState(user);
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
