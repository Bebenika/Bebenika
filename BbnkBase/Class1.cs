


    public interface Cbbnk : IDisposable
    {
        public Cbbnk(string name)
        void DisposedException()
        public Session CurrentSession
        public virtual bool TestPermission(Permissions permission, Cbbnk target)
        public virtual void CheckPermission(Permissions permission, Cbbnk target)
        public Cbbnk CreateProxy()
        public long ID
        public long? DbID
        protected virtual string DefaultName
        public object? Value
        public Cbbnk? Parent
        public Cbbnk ProxySource
        {
            get
            {
                if (Disposed) DisposedException();
                if (_ProxySource == null)
                    return this;
                return _ProxySource;
            }
            set
            {
                if (Disposed) DisposedException();
                if (value == null) value = this;
                if (_ProxySource != this)
                {
                    if (_ProxySource != null)
                    {
                        Cbbnk c = (Cbbnk)_ProxySource;
                        c.RemoveProxyChild(this);
                    }
                }
                _ProxySource = value;
                if (_ProxySource != this)
                {
                    Cbbnk c = (Cbbnk)_ProxySource;
                    c.AddProxyChild(this);
                }
            }
        }
        public bool IsProxy
        protected virtual void Clear()
        public void Dispose()
    }
    public class cUser : Cbbnk
    {


        public string UserName
        public string Password
    }

    public class Session : Cbbnk
    {

  
        public cUser? User


        public override bool TestPermission(Permissions permission, Cbbnk target)

        public override void CheckPermission(Permissions permission, Cbbnk target)

    }

    public sealed class System : Session
    {

        public static readonly System Instance = new();
        public System()
        {
            if (Instance != null) throw new Exception("Only one instance of this class can be created");
            Name = "SYSTEM";
        }

        public override void CheckPermission(Permissions permission, Cbbnk target)
        public override bool TestPermission(Permissions permission, Cbbnk target)



    }
    public class PermissionException : Exception
    {
        public PermissionException(Permissions permission) 
        public Permissions Permission;
        public override string Message
    }
    public enum Permissions
    {
        select,
        updateParent,
        updateValue,
        updateName,
        createAnyBbnk
    }

