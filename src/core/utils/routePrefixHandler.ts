const addRoutePrefix = (route: string, prefix: string) => {
    route = route.toString()
    prefix = prefix.toString()
    
    if (route[0] === "/")
        route = route.slice(1, route.length)

    if (prefix[prefix.length - 1] === "/")
        prefix = prefix.slice(0, prefix.length - 1)

    if (prefix[0] !== "/")
        prefix = `/${prefix}`

    route = `${prefix}/${route}`

    return route
}

export default addRoutePrefix