serify == reversibly transform an unserializable value into a serializable one

deserify === do the exact opposite

`serify(value<any>, [options] <object>)`

Mutates any value and replaces it with the output object described below.
Recursively serifies objects & arrays from the top down. `options` will be
assigned to default `options` object.

```
deserified = <any>

options = {
    serifier: <primitive>,
    classes: {
        <className>: {
            serify: (unserified) => serifying_logic(unserified),
            deserify: (serified) => deserifying_logic(unserified),
        },
        ...
    }
}

serified = <any> | {
    serifier: <primitive>,
    type: <string>,
    value: <any>
}
```

`deserify(value<any>, [options] <object>)`

Mutates any value. If `value` matches a template described in the `options`
object, replaces it with its deserified version. Recursively deserifies objects
& arrays from the bottom up. `options` will be assigned to default `options`
object.

Default options cover:

- BigInt
- Date
- Map
- Set

```
// Default serifying logic is toString(). Default deserifying logic is object constructor.

defaultOptions = {
    serifier: null,
    classes: {
        BigInt: {
            serify: (unserified) => serifying_logic(unserified), // TODO
            deserify: (serified) => deserifying_logic(unserified), // TODO
        },
        Date: {
            serify: (unserified) => serifying_logic(unserified), // TODO
            deserify: (serified) => deserifying_logic(unserified), // TODO
        },
        Map: {
            serify: (unserified) => serifying_logic(unserified), // TODO
            deserify: (serified) => deserifying_logic(unserified), // TODO
        },
        Set: {
            serify: (unserified) => serifying_logic(unserified), // TODO
            deserify: (serified) => deserifying_logic(unserified), // TODO
        }
    }
}
```
