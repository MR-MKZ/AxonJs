import { Axon } from "../../src";

export class MainDB {
    async getUser(id: number) {
        return {
            id,
            name: "Erfan"
        }
    }
}

export const findUser = async (id: number) => {
    return {
        msg: "User not found!"
    }
}

const core = Axon();

// Register dependency with a name
// class as dependency
core.registerDependencyValue("MainDB", new MainDB());

// Register dependency with aliases
// Main name will choose ReplicateDB (first item)
core.registerDependencyValue(["ReplicateDB", "RDB", "secondDB"], new MainDB());

// Register a factory function to make instance each time the dependency will call. 
// (core will run factory automatically)
core.registerDependencyFactory("testDep", () => new MainDB());

// Register function as dependency
core.registerDependencyValue("userQuery", findUser);

core.listen();