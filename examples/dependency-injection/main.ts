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
core.registerDependency("MainDB", new MainDB());

// Register dependency with aliases
// Main name will choose ReplicateDB (first item)
core.registerDependency(["ReplicateDB", "RDB", "secondDB"], new MainDB());

// Register dependency without making instance. (core will make instance automatically)
core.registerDependency("testDep", MainDB);

// Register function as dependency
core.registerDependency("userQuery", findUser);

core.listen();