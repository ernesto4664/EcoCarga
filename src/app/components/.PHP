<?php

namespace App\Http\Controllers;

use App\Helpers\UtilHelper;
use App\Notification;
use App\Post;
use App\Release;
use App\User;
use Carbon\Carbon;
use DateTime;
use DateTimeZone;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotifyController extends Controller
{
    public function __construct()
    {
        $this->utilHelper = new UtilHelper();
    }

    public function send(Request $request)
    {
        $dateCurrent = date("Y-m-d H:i");

        Validator::validate(
            ['text' => $request->text],
            ['text' => 'required']
        );

        $post = Post::select('posts.id as id', 'posts.slug', 'districts.code as dependence_code', DB::raw('"post"'), 'regions.code as code_region', 'positions.code as code_position')
            ->join('post_districts', 'post_districts.post_id', 'posts.id')
            ->join('districts', 'post_districts.district_id', 'districts.id')
            ->join('post_positions', 'post_positions.post_id', 'posts.id')
            ->join('positions', 'post_positions.position_id', 'positions.id')
            ->join('post_regions', 'post_regions.post_id', 'posts.id')
            ->join('regions', 'post_regions.region_id', 'regions.id')
            ->where('is_send_notification', 0)
            ->groupBy('dependence_code', 'code_region', 'code_position', 'id')
            ->get()->toArray();

        $release = Release::select('releases.id as id', 'releases.slug', 'districts.code as dependence_code', DB::raw('"release"'), 'regions.code as code_region', 'positions.code as code_position')
            ->join('release_districts', 'release_districts.release_id', 'releases.id')
            ->join('districts', 'release_districts.district_id', 'districts.id')
            ->join('release_positions', 'release_positions.release_id', 'releases.id')
            ->join('positions', 'release_positions.position_id', 'positions.id')
            ->join('release_regions', 'release_regions.release_id', 'releases.id')
            ->join('regions', 'release_regions.region_id', 'regions.id')
            ->where('is_send_notification', 0)
            ->groupBy('dependence_code', 'code_region', 'code_position', 'id')
            ->get()->toArray();

        $publication = array_merge($release, $post);

        foreach ($publication as $value) {
            $users = User::select('tipest as dependence_code', 'id', 'persk as code_position', 'werks as code_region')
                ->where('tipest', $value['dependence_code'])
                ->where('persk', $value['code_position'])
                ->where('werks', $value['code_region'])
                ->where('is_notification_settlement', 0)
                ->groupBy('dependence_code', 'code_position', 'code_region', 'id')
                ->get();

            if (isset($value['post']) && $value['post'] == 'post') {
                Post::where('id', $value['id'])->update(['is_send_notification' => 1]);
                $this->saveNotification('post', $users, $value);
            }

            if (isset($value['release']) && $value['release'] == 'release') {
                Release::where('id', $value['id'])->update(['is_send_notification' => 1]);
                $this->saveNotification('release', $users, $value);
            }
        }

        return response()->json(['data' => 'Notificación enviada con éxito'], 200);
    }

    public function transformUtfToLocalDate($dateTime)
    {
        $transformDate = new DateTime($dateTime, new DateTimeZone('UTC'));
        $transformDate->setTimezone(new DateTimeZone('America/Santiago'));
        return $transformDate->format('Y-m-d H:i');
    }

    public function saveNotification($type, $users, $object)
    {
        if (count($users) > 0) {
            foreach ($users as $user) {
                $notification = new Notification();
                $notification->object_id = $object['id'];
                $notification->user_id = $user->id;
                $notification->type = $type;
                $notification->save();
            }
        }
    }

    public function getNotification(Request $request)
    {
        $user = $request->query('id');

        $notifications = Notification::select(
            'notifications.id as notification_id',
            'notifications.object_id',
            'notifications.type',
            'notifications.is_read',
            'notifications.datetime',
            'posts.id as post_id',
            'posts.title as post_title',
            'posts.post_content as post_content',
            'releases.id as release_id',
            'releases.post_content as release_text',
            'releases.title as release_heading'
        )
            ->leftJoin('posts', function ($join) {
                $join->on('posts.id', '=', 'notifications.object_id');
                $join->where('notifications.type', '=', 2);
            })
            ->leftJoin('releases', function ($join) {
                $join->on('releases.id', '=', 'notifications.object_id');
                $join->whereIn('notifications.type', [3, 4]);
            })
            ->where('notifications.user_id', $user)
            ->where('notifications.is_read', 0)
            ->orderBy('notifications.datetime', 'desc')
            ->limit(10)
            ->get();

        $payload = [];

        foreach ($notifications as $notification) {
            $payload[] = [
                'notification_id' => $notification->notification_id,
                'type' => $notification->type,
                'datetime' => $notification->datetime,
                'is_read' => $notification->is_read,
                'post' => $notification->post_id ? [
                    'id' => $notification->post_id,
                    'title' => $notification->post_title,
                    'content' => $notification->post_content,
                ] : null,
                'release' => $notification->release_id ? [
                    'id' => $notification->release_id,
                    'text' => $notification->release_text,
                    'heading' => $notification->release_heading,
                ] : null,
            ];
        }

        return response()->json($payload);
    }

    public function postById($data, $user)
    {
        $post = Post::select('posts.title', 'posts.slug', 'notifications.id as id_notification')
            ->whereIn('posts.id', explode(',', $data['post_id']))
            ->where('type', 2)
            ->where('notifications.user_id', $user)
            ->where('notifications.is_read', 0)
            ->join('notifications', 'posts.id', 'notifications.object_id')
            ->distinct()
            ->groupBy('posts.slug', 'posts.title', 'id_notification')
            ->get();
        //dd($post);
        $payload = [];
        foreach ($post as $value) {
            $payload[] = [
                'icon' => 'library_books',
                'title' => $value->title,
                'text' => 'ActualizaciÃƒÂ³n de noticia',
                'id' => $value->id_notification,
                'meta' => [
                    'name' => 'new',
                ],
                'params' => [
                    'slug' => $value->slug,
                ],
            ];
        }
        return $payload;
    }

    public function releaseById($data, $user)
    {
        $utilHelper = new UtilHelper();
        $payload = [];
        $release = Release::select('releases.slug', 'releases.title', 'notifications.id as id_notification', 'is_job_offer')
            ->join('notifications', 'releases.id', 'notifications.object_id')
            ->whereIn('releases.id', explode(',', $data['releases_id']))
            ->whereIn('type', [3, 4])
            ->where('notifications.user_id', $user)
            ->where('notifications.is_read', 0)
            ->groupBy('releases.slug', 'releases.title', 'id_notification', 'is_job_offer')
            ->get();
        foreach ($release as $value) {
            $payload[] = [
                'icon' => $value->is_job_offer ? 'warning' : 'work',
                'title' => $value->title,
                'text' => $value->is_job_offer ? 'ActualizaciÃƒÂ³n de las ofertas laborales' : 'Revisa el comunicado completo acÃƒÂ¡',
                'id' => $value->id_notification,
                'meta' => [
                    'name' => $value->is_job_offer ? 'job' : 'release',
                ],
                'params' => [
                    'slug' => $value->slug,
                ],
            ];
        }
        return $payload;
    }
    public function liquidation($value, $user)
    {
        $payload = [];
        $notification = Notification::where('notifications.user_id', $user)
            ->where('notifications.is_read', 0)
            ->where('notifications.type', 1)
            ->distinct()->get();
        foreach ($notification as $value) {
            $dt = Carbon::createMidnightDate($value['datetime'])->settings([
                'monthOverflow' => false,
            ]);
            $periodString = $this->utilHelper->getMountString($dt->copy()->subMonths(1)->format('Y-m-d'));
            $payload[] = [
                'icon' => 'attach_money',
                'id' => $value->id,
                'title' => 'LiquidaciÃƒÂ³n de sueldo',
                'text' => 'Revisa la liquidaciÃƒÂ³n / ' . $periodString,
                'meta' => [
                    'name' => 'salary',
                ],
                'params' => [
                    'type' => 2,
                    'period' => $dt->copy()->subMonths(1)->format('Ym'),
                ],
            ];
        }
        return $payload;
    }

    public function readNotification(Request $request)
    {
        $notification = Notification::find($request->id);
        $payload = [];
        $post = [];
        $release = [];
	if (!$notification) {
   	return response()->json(['datos_recibidos' => $request->all()]);
	}
        if ($notification) {
            $notification->is_read = 1;
            $notification->save();
            //$user = auth()->user();
	      $user = $request->user;
            $notification = Notification::select(
                DB::raw('DATE_FORMAT(notifications.datetime, "%Y-%m-%d") as date'),
                DB::raw("group_concat(distinct(posts.id) SEPARATOR ',') as post_id"),
                DB::raw("group_concat(distinct(releases.id) SEPARATOR ',') as releases_id"),
                DB::raw("group_concat(distinct(notifications.type) SEPARATOR ',') as type"),
                DB::raw("group_concat(distinct(notifications.id) SEPARATOR ',') as id_notification"),
                DB::raw("group_concat(distinct(releases.is_job_offer) SEPARATOR ',') as is_job_offer"),
            )
                ->leftJoin('posts', function ($join) {
                    $join->on('posts.id', '=', 'notifications.object_id');
                    $join->where('notifications.type', '=', 2);
                })
                ->leftJoin('releases', function ($join) {
                    $join->on('releases.id', '=', 'notifications.object_id');
                    $join->whereIn('notifications.type', [3, 4]);
                })
                ->join('users', 'users.id', 'notifications.user_id')
                ->groupBy(DB::raw('DATE_FORMAT(notifications.datetime, "%Y-%m-%d")'))
                ->orderBy('date', 'desc')->where('notifications.is_read', 0)->where('notifications.user_id', $user)
                ->get();

            $post = [];
            $release = [];
            $payload = [];
            $liquidation = [];
            foreach ($notification as $value) {
                if ($value->post_id) {
                    $post = $this->postById($value, $user);
                }
                if ($value->releases_id) {
                    $release = $this->releaseById($value, $user);
                }
                $typeArray = explode(',', $value['type']);

                if (in_array('1', $typeArray)) {
                    $liquidation = $this->liquidation($value, $user);
                }
                $dataNotification = array_merge($post, $release, $liquidation);

                $payload[] = [
                    'title' => $this->utilHelper->getTimestampNotification($value->date),
                    'notifications' => $dataNotification,
                ];
                $release = [];
                $liquidation = [];
                $post = [];
            }
        }
        return response()->json($payload);
    }
}