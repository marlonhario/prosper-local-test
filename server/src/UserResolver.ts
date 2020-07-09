import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int
} from "type-graphql";
import { compare, hash } from "bcryptjs";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";
import { 
  createRefreshToken, 
  createAccessToken, 
  createVerificationToken, 
  verifyToken, 
  decodeToken 
} from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import * as nodemailer from 'nodemailer';

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
			user: process.env.EMAIL_FROM,
			pass: process.env.EMAIL_PASS
	}
});

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
	}
	
	@Mutation(() => String)
  async verification(
    @Arg("token") token: string
	) {
    if (token) {
      const isVerifyToken: any = verifyToken(token);
     
      if (isVerifyToken) {
        const getDecodedToken: any =  decodeToken(token);
        const { email, password } = getDecodedToken;
       
        const hashedPassword = await hash(password, 12);

        try {
          await User.insert({
            email,
            password: hashedPassword
          });
        } catch (err) {
          console.log('error while saving your account');
          return 'error while saving your account';
        }
        console.log('Successfully create account');
        return 'Successfully created account';
      }
    } else {
      console.log('Trouble when verifying your token');
      return 'Trouble when verifying your token'
    }
    console.log('Token invalid');
    return 'Token invalid'
  }


  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload);
    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");

    return true;
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("could not find user");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("bad password");
    }

    // login successful

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user
    };
  }

  @Mutation(() => Boolean)
  register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
		const verificationDetails = createVerificationToken(
			email,
			password
		);

		var mailOptions = { 
      from : 'hariomarlon83@gmail.com', 
      to : email, 
      subject : 'Hello', 
      html: `
            <h1>Please click to link to activate</h1>
            <p>${process.env.CLIENT_URL}/verification/${verificationDetails}</p>
            <hr />
            <p>This email contain sensetive info</p>
            <p>${process.env.CLIENT_URL}</p>
        `
    }; 

    transporter.sendMail( mailOptions, (error, info) => { 
      if (error) { 
        console.log(`error: ${error}`);
        return false;
      } 
      console.log(`Message Sent ${info.response}`); 
      return true;
    }); 

    return true;
  }
}


