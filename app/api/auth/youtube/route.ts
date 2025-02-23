import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: "Not authenticated", authUrl: "/api/auth/signin/google" },
        { status: 401 }
      );
    }

    const { channelName, email } = await req.json();

    if (!channelName || !email) {
      return NextResponse.json(
        { message: "Channel name and email are required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Get the user's channel information
    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      return NextResponse.json(
        { message: "No YouTube channel found" },
        { status: 404 }
      );
    }

    // Verify if the channel name matches
    const actualChannelName = channel.snippet?.title;
    if (actualChannelName?.toLowerCase() !== channelName.toLowerCase()) {
      return NextResponse.json(
        { message: "Channel name does not match" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        name: actualChannelName,
      },
    });
  } catch (error) {
    console.error("YouTube verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify YouTube channel" },
      { status: 500 }
    );
  }
}
