from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

_scheduler = None

def start_scheduler():
    global _scheduler

    if _scheduler is not None and _scheduler.running:
        return

    from schedular.jobs import process_scheduled_orders

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        process_scheduled_orders,
        trigger=CronTrigger(hour=0, minute=0),
        id="process_scheduled_orders",
        replace_existing=True
    )
    _scheduler.start()
    print("[Scheduler] Started — runs daily at midnight.")

def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        print("[Scheduler] Stopped.")