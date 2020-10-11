export interface SlackEvent {
  type: string;
  event_ts?: string;
  user: string;
}

export interface Reaction {
  name: string;
  count: number;
  users: string[];
}

export interface MessageEvent extends SlackEvent {
  text: string;
  ts?: string;
  channel?: string;
  channel_type?: string;
  edited?: {
    user: string;
    ts: string;
  };
  subType?: string;
  reactions?: Reaction[];
  is_starred?: boolean;
  pinned_to?: string[];
  hidden?: boolean;
}

export interface SlackAuthorizations {
  enterprise_id: string;
  team_id: string;
  user_id: string;
  is_bot: boolean;
}

export interface SlackEventBody<T = SlackEvent> {
  token: string;
  team_id: string;
  api_app_id: string;
  event: T;
  type: string;
  authed_users?: string[];
  authed_teams?: string[];
  authorizations: SlackAuthorizations;
  event_context: string;
  event_id: string;
  event_time: number;
}

export interface SlackSlashCommandBody {
  token: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
  user_id: string;
  team_id?: string;
  enterprise_id?: string;
  channel_id?: string;
  api_app_id: string;
}
