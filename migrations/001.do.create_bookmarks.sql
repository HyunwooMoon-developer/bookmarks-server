CREATE TABLE bookmarks (
    id INTEGER primary key generated by default as identity,
    title text not null,
    url text not null,
    description text,
    rating integer
);