import "dotenv/config.js";
import connectDB from "./create-pool.js";

const db = connectDB();
const dbName = process.env.MYSQL_DB;

console.log("Limpiando base de datos vieja...");
await db.query(`DROP DATABASE IF EXISTS ${dbName}`);

console.log("Creando base de datos de c3d");
await db.query(`CREATE DATABASE ${dbName}`);
await db.query(`USE ${dbName}`);

/* --------------------------------USUARIOS------------------------------------ */

console.log("Creando tabla users...");
await db.query(`
CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    name VARCHAR(30),
    last_name VARCHAR(50),
    dni VARCHAR(20) UNIQUE,
    birth_date DATE,
    email VARCHAR(50) NOT NULL UNIQUE,
    profession VARCHAR(150),
    address VARCHAR(100),
    city VARCHAR(50),
    post_code VARCHAR(30),
    province VARCHAR(50),
    password VARCHAR(60) CHECK(
        CHAR_LENGTH(password) >=8 AND 
        password REGEXP '[A-Z]' AND
        password REGEXP '[0-9]'
        ) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(255),
    current_token VARCHAR(255),
    activated_account BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    is_administrator BOOLEAN DEFAULT FALSE,
    activation_code VARCHAR (10),
    reactivation_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`);

/* --------------------------PERFILES PROFESIONALES-------------------------- */

console.log("Creando tabla business_accounts...");
await db.query(`
CREATE TABLE business_accounts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    company_name VARCHAR(30),
    NIF_CIF VARCHAR(20) UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(100),
    city VARCHAR(50),
    post_code VARCHAR(30),
    province VARCHAR(50),
    password VARCHAR(60) CHECK(
        CHAR_LENGTH(password) >=8 AND 
        password REGEXP '[A-Z]' AND
        password REGEXP '[0-9]'
        ) NOT NULL,
    phone_number VARCHAR(20),
    business_image_url VARCHAR(255),
    current_token VARCHAR(255),
    activated_account BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    commercial_activity VARCHAR(90),
    activation_code VARCHAR (10),
    reactivation_code VARCHAR(10),
    local_fisico BOOLEAN DEFAULT FALSE,
    local_virtual BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    unity_position_x FLOAT DEFAULT NULL,
    unity_position_y FLOAT DEFAULT NULL,
    unity_position_z FLOAT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);


/* --------------------------MEDIA DE NEGOCIOS (Galería)-------------------------- */

console.log("Creando tabla business_galleries...");
await db.query(`
CREATE TABLE business_galleries (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    business_id INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    gallery_type ENUM('photo', 'video') NOT NULL DEFAULT 'photo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);
`);

console.log("Creando tabla business_media...");
await db.query(`
CREATE TABLE business_media (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    gallery_id INT UNSIGNED NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gallery_id) REFERENCES business_galleries(id) ON DELETE CASCADE
);
`);

/* --------------------------PUBLICACIONES TEMPORALES-------------------------- */

console.log("Creando tabla business_posts...");
await db.query(`
CREATE TABLE business_posts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    business_id INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    media_url VARCHAR(255),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);
`);

/* --------------------------INFORMACIÓN ADICIONAL DEL NEGOCIO-------------------------- */

console.log("Creando tabla business_info...");
await db.query(`
CREATE TABLE business_info (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    business_id INT UNSIGNED NOT NULL UNIQUE,
    opening_hours_time TIME,
    closing_hours_time TIME,
    additional_info TEXT,
    website_url VARCHAR(255),
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    twitter_url VARCHAR(255), 
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);
`);


/* --------------------------------INTERESES----------------------------------- */

console.log("Creando tabla interests...");
await db.query(`
CREATE TABLE interests (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`);

console.log("Creando tabla user_interests...");
await db.query(`
CREATE TABLE user_interests (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    interest_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE,
    UNIQUE(user_id, interest_id)
);
`);

/* ------------------------------INTERESES DE NEGOCIOS---------------------------- */

console.log("Creando tabla business_interests...");
await db.query(`
CREATE TABLE business_interests (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    business_id INT UNSIGNED NOT NULL,
    interest_id INT UNSIGNED NOT NULL,

    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE,

    UNIQUE(business_id, interest_id)
);
`);

/* --------------------------LIKES Y FAVORITOS------------------------------------- */

console.log("Creando tabla business_likes...");
await db.query(`
CREATE TABLE business_likes (
    user_id INT UNSIGNED NOT NULL,
    business_id INT UNSIGNED NOT NULL,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, business_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);
`);

console.log("Creando tabla favorite_businesses...");
await db.query(`
CREATE TABLE favorite_businesses (
    user_id INT UNSIGNED NOT NULL,
    business_id INT UNSIGNED NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, business_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);
`);

/* --------------------------CREACIÓN DE COLECTIVOS-------------------------------- */

console.log("Creando tabla collectives...");
await db.query(`
CREATE TABLE collectives (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by_user_id INT UNSIGNED,
    created_by_business_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,

    CHECK (
        (created_by_user_id IS NOT NULL AND created_by_business_id IS NULL)
        OR (created_by_user_id IS NULL AND created_by_business_id IS NOT NULL)
    )
);
`);

console.log("Creando tabla collective_interests...");
await db.query(`
CREATE TABLE collective_interests (
    collective_id INT UNSIGNED NOT NULL,
    interest_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (collective_id, interest_id),
    FOREIGN KEY (collective_id) REFERENCES collectives(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);
`);

console.log("Creando tabla collective_members...");
await db.query(`
CREATE TABLE collective_members (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collective_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED,
    business_id INT UNSIGNED,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (collective_id) REFERENCES collectives(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,

    UNIQUE (collective_id, user_id, business_id),

    CHECK (
        (user_id IS NOT NULL AND business_id IS NULL)
        OR (user_id IS NULL AND business_id IS NOT NULL)
    )
);

`);

console.log("Creando tabla collective_messages...");
await db.query(`
CREATE TABLE collective_messages (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collective_id INT UNSIGNED NOT NULL,
    sender_user_id INT UNSIGNED,
    sender_business_id INT UNSIGNED,
    message TEXT,
    media_url VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (collective_id) REFERENCES collectives(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    CHECK (
        (sender_user_id IS NOT NULL AND sender_business_id IS NULL)
        OR (sender_user_id IS NULL AND sender_business_id IS NOT NULL)
    )
);
`);

console.log("Creando tabla collective_media...");
await db.query(`
CREATE TABLE collective_media (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collective_id INT UNSIGNED NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_type ENUM('photo', 'video') NOT NULL,
    description TEXT,
    uploaded_by INT UNSIGNED NOT NULL,
    approved BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collective_id) REFERENCES collectives(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
`);

/* -----------------------SOLICITUDES Y NOTIFICACIONES------------------------- */

console.log("Creando tabla notifications...");
await db.query(`
CREATE TABLE notifications (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    sender_user_id INT UNSIGNED,
    sender_business_id INT UNSIGNED,
    sender_collective_id INT UNSIGNED,

    receiver_user_id INT UNSIGNED,
    receiver_business_id INT UNSIGNED,
    receiver_collective_id INT UNSIGNED,

    type ENUM(
        'direct_message',
        'inbox_message',
        'new_post',
        'group_invite',
        'platform_notice'
    ) NOT NULL,

    title VARCHAR(150),
    body TEXT,
    reference_id INT UNSIGNED,
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sender_business_id) REFERENCES business_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (sender_collective_id) REFERENCES collectives(id) ON DELETE SET NULL,

    FOREIGN KEY (receiver_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_collective_id) REFERENCES collectives(id) ON DELETE CASCADE
);
`);


console.log("Creando tabla collective_join_requests...");
await db.query(`
CREATE TABLE collective_join_requests (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collective_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED,
    business_id INT UNSIGNED,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collective_id) REFERENCES collectives(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    CHECK (
        (user_id IS NOT NULL AND business_id IS NULL)
        OR (user_id IS NULL AND business_id IS NOT NULL)
    )
);
`);

/* -------------------------------- AMIGOS------------------------------------- */

console.log("Creando tabla friend_requests...");
await db.query(`
CREATE TABLE friend_requests (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sender_id INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,

    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE (sender_id, receiver_id) -- evita duplicados
);
`);

console.log("Creando tabla user_friends...");
await db.query(`
CREATE TABLE user_friends (
    user_id INT UNSIGNED NOT NULL,
    friend_id INT UNSIGNED NOT NULL,
    since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

`);

/* -------------------------------- POSTS-------------------------------------- */

console.log("Creando tabla posts...");
await db.query(`
CREATE TABLE posts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    author_user_id INT UNSIGNED,
    author_business_id INT UNSIGNED,
    
    type ENUM('general', 'offer', 'request') NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT,
 
    interest_id INT UNSIGNED, 

    media_url VARCHAR(255),
    media_type ENUM('photo', 'video', 'none') DEFAULT 'none',
    
    visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (author_business_id) REFERENCES business_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE SET NULL

);
`);

/* --------------------------------COMMENTS------------------------------------ */

console.log("Creando tabla comments...");
await db.query(`
CREATE TABLE post_comments (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    post_id INT UNSIGNED NOT NULL,
    
    author_user_id INT UNSIGNED,
    author_business_id INT UNSIGNED,
    
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (author_business_id) REFERENCES business_accounts(id) ON DELETE SET NULL
);
`);

/* --------------------------------REPORTES------------------------------------ */

console.log("Creando tabla reports...");
await db.query(`
CREATE TABLE reports (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    reported_by_user_id INT UNSIGNED,
    reported_by_business_id INT UNSIGNED, 
    reported_user_id INT UNSIGNED,
    reported_business_id INT UNSIGNED,
    reported_entity_type ENUM('user', 'business_account', 'post', 'message') NOT NULL,
    reported_entity_id INT UNSIGNED NOT NULL,
    reason TEXT,
    status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
    resolved_by_user_id INT UNSIGNED,
    resolved_at TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    CHECK (
        (reported_by_user_id IS NOT NULL AND reported_by_business_id IS NULL) OR
        (reported_by_user_id IS NULL AND reported_by_business_id IS NOT NULL)
    ),
    CHECK (
        (reported_user_id IS NOT NULL AND reported_business_id IS NULL) OR
        (reported_user_id IS NULL AND reported_business_id IS NOT NULL)
    )
);

`);

console.log("Creando tabla account_restrictions...");
await db.query(`
CREATE TABLE account_restrictions (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NULL,
    business_id INT UNSIGNED NULL,
    imposed_by_admin_id INT UNSIGNED NULL,
    reason ENUM('pending_report', 'legal_hold', 'internal_investigation', 'user_suspended'),
    related_report_id INT UNSIGNED NULL,
    active BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lifted_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (imposed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (related_report_id) REFERENCES reports(id) ON DELETE SET NULL,

    CHECK (
  (user_id IS NOT NULL AND business_id IS NULL)
  OR (user_id IS NULL AND business_id IS NOT NULL)
)
);

`);


/* --------------------------------MENSAJERÍA------------------------------------ */

console.log("Creando tabla direct_messages...");
await db.query(`
CREATE TABLE direct_messages (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sender_user_id INT UNSIGNED,
    sender_business_id INT UNSIGNED,
    receiver_user_id INT UNSIGNED,
    receiver_business_id INT UNSIGNED,
    message TEXT,
    media_url VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    CHECK (
        (sender_user_id IS NOT NULL AND sender_business_id IS NULL)
        OR (sender_user_id IS NULL AND sender_business_id IS NOT NULL)
    ),
    CHECK (
        (receiver_user_id IS NOT NULL AND receiver_business_id IS NULL)
        OR (receiver_user_id IS NULL AND receiver_business_id IS NOT NULL)
    )
);
`);

console.log("Creando tabla inbox_messages...");
await db.query(`
CREATE TABLE inbox_messages (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sender_user_id INT UNSIGNED,
    sender_business_id INT UNSIGNED,
    receiver_user_id INT UNSIGNED,
    receiver_business_id INT UNSIGNED,
    subject VARCHAR(150),
    body TEXT,
    media_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_business_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
    CHECK (
        (sender_user_id IS NOT NULL AND sender_business_id IS NULL)
        OR (sender_user_id IS NULL AND sender_business_id IS NOT NULL)
    ),
    CHECK (
        (receiver_user_id IS NOT NULL AND receiver_business_id IS NULL)
        OR (receiver_user_id IS NULL AND receiver_business_id IS NOT NULL)
    )
);
`);

console.log("Base de datos creada correctamente");

await db.end();
