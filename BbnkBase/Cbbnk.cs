using System.ComponentModel;
using System.Diagnostics;
using System.Security;

namespace BbnkBase
{


    // Bu class Herşeyin Class ı olacak 
    // cBbnk interface inden iretilecek
    public  class Cbbnk : IDisposable
    {
        //Tasklar icin Session Tanimi 
        public static ThreadLocal<Session> _Current_Session = new ThreadLocal<Session>(() => new System());




        private static long idCounter = 0;//Runtime ID icin
        private static readonly Dictionary<long, Cbbnk> activeObjects = new Dictionary<long, Cbbnk>();
        private static void AddObject(Cbbnk obj)
        {
            lock (activeObjects)
            {
                obj.SetID(idCounter);
                activeObjects.Add(idCounter, obj);
                idCounter++;
            }

        }
        private static void RemoveObject(Cbbnk obj)
        {
            lock (activeObjects)
            {
                activeObjects.Remove(obj.ID);
            }
        }

        
        public static System Sys
        {
            get
            {
             
                    
                return BbnkBase.System.Instance;  

            }
        }

        public Cbbnk()
        {
            if (this is not  System)
            {
                CheckPermission(Permissions.createAnyBbnk, this);
            }
            AddObject(this);
        }
        public Cbbnk(string name)
        {
            if (this is not System)
            {
                CheckPermission(Permissions.createAnyBbnk, this);
            }
            AddObject(this);
            Name= name; 
        }
        ~Cbbnk()
        {
            Dispose();
        }
        void  DisposedException()
        {
            throw new Exception("Disposed Object");
        }
        public Session CurrentSession
        {
            get
            {
                if (Disposed) DisposedException();
                if (_Current_Session.Value == null) throw new Exception("not found a Session");
                return _Current_Session.Value;
            }
        }

        public virtual  bool TestPermission(Permissions permission, Cbbnk target)
        {
            if (Disposed) DisposedException();
            if (CurrentSession == null)
            {
                throw new Exception("No Session");
            }
            return  CurrentSession.TestPermission(permission, target);
        }

        public virtual  void CheckPermission(Permissions permission, Cbbnk target)
        {
            if (CurrentSession == null)
            {
                throw new Exception("No Session");
            }
            CurrentSession.CheckPermission(permission, target);
        }


        public Cbbnk CreateProxy()
        {
            if (Disposed) DisposedException();
            Cbbnk proxy = new Cbbnk
            {
                ProxySource = this
            };
            return proxy;

        }


        private void SetID(long id)
        {
            if (Disposed) DisposedException();
            _ID = id;
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private long _ID = 0;
        public long ID { get { return _ID; } }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private readonly long? _DbID = null;
        public long? DbID
        {
            get
            {
                if (Disposed) DisposedException();
                if (IsProxy) return ProxySource.DbID;
                return _DbID;

            }
        }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private string _Name="";

        protected virtual string GetName()
        {
            return _Name;
        }

        protected virtual void SetName(string name)
        {
            _Name = name;
        }
        
        //Name Parent Icinde Benzersiz olmali 
        //Bun Temin edecek Metod

        protected virtual  string DefaultName
        {
            get
            {
                return "NewObject";
            }
        }
        protected Cbbnk? GetChildByName(string? name)
        {
            if (Disposed) DisposedException();
            if (name == null) return null;  
            Cbbnk? res = null;
            _Children.TryGetValue(name, out res);
            return res;
        }
        protected  string CheckName(string name)
        {
            if (Disposed) DisposedException();
            if (Parent==null) return name;
            if (name == null) name = DefaultName;
            if (name=="") name=DefaultName;
            string newName = name;
            int count = 1;
            while(GetChildByName(newName) != null)
            {
                newName=name+"_"+count++;
            }
            return newName; 
        }
        public string Name
        {
            get
            {
                if (Disposed) DisposedException();
                if (IsProxy) return ProxySource.Name;
                return GetName();
            }
            set
            {
                if (Disposed) DisposedException();
                string oldName=GetName();
                if (Parent!=null) value =Parent.CheckName(value);
                CheckPermission(Permissions.updateName, this);
                if (IsProxy) ProxySource.Name = value;
                SetName(value);
                if (Parent != null) {
                    Parent._Children.Remove(oldName);
                    Parent._Children.Add(oldName,this);
                }

            }
        }

        public string Path
        {
            get
            {
                if (Disposed) DisposedException();
                if (Parent==null) return Name;
                return Parent.Path + "." + Name;
            }
        }
        public override string ToString()
        {
            if (Disposed) DisposedException();
            string res = Path;
            if (IsProxy) 
            { 
                res = "Proxy (" + res + ") "; 
            }
            return ID.ToString()+" --> "+ res;
        }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private object? _Value;
        protected virtual object? GetValue()
        {
            return _Value;
        }
        protected virtual void SetValue(object? value)
        {
            _Value = value;
        }
        public object? Value
        {
            get
            {
                if (Disposed) DisposedException();
                if (IsProxy) return ProxySource.Value;
                return GetValue();
            }
            set
            {
                if (Disposed) DisposedException();
                CheckPermission(Permissions.updateValue, this);
                if (IsProxy) ProxySource.Value = value;

                SetValue(value);
            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private Cbbnk? _Parent;
        protected virtual Cbbnk? GetParent()
        {
            return _Parent;
        }
        protected virtual void SetParent(Cbbnk? value)
        {
            if (value != null)
            {
                Cbbnk? c = value.GetChildByName(Name);
                if (c != null) { throw new Exception("This object exists with this name."); }
            }
            if (_Parent != null)
            {
                _Parent._Children.Remove(this.Name);
            }
            _Parent = value;
            if (_Parent != null)
            {
                _Parent._Children.Add(this.Name,this);
            }
        }
        public Cbbnk? Parent
        {
            get
            {
                if (Disposed) DisposedException();
                if (IsProxy) return ProxySource.Parent;
                return GetParent();
            }
            set
            {
                if (Disposed) DisposedException();
                string? name = null;
                CheckPermission(Permissions.updateParent, this);
                if (value!=null)
                {
                    name = value.CheckName(this.Name);
                }
                if (IsProxy) {ProxySource.Parent = value;return; }
                
                SetParent(value);
            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private readonly Dictionary<string, Cbbnk> _Children = new Dictionary<string, Cbbnk>();

        bool existListbuf(Cbbnk c, List<Cbbnk> buf)
        {
            for (int i = 0; i < buf.Count; i++)
            {
                if (buf[i].ProxySource == c)
                {
                    buf[i].childBufFlag = true;
                    return true;
                }
            }
            return false;
        }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        bool childBufFlag = false;
        protected virtual void AddChildToBuf(List<Cbbnk> buf)
        {
            List<KeyValuePair<string, Cbbnk>> lst = _Children.ToList();
            List<Cbbnk> eklenecekler = new List<Cbbnk>();
            for (int i = 0; i < lst.Count; i++)
            {
                if (TestPermission(Permissions.select, lst[i].Value))
                {
                    Cbbnk c = lst[i].Value;
                    if (existListbuf(c, buf))
                    {

                    }
                    else
                    {
                        Cbbnk cx = c.CreateProxy();
                        cx.childBufFlag = true;
                        buf.Add(cx);
                    }
                    
                }
                
            }
            for (int i = 0; i < childBuf.Count; i++)
            {
                if (!childBuf[i].childBufFlag)
                {
                    childBuf[i].Dispose();
                    childBuf.RemoveAt(i);
                }
            }

        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        readonly List<Cbbnk> childBuf = new List<Cbbnk>();
        public Cbbnk[] Children
        {
            get
            {
                if (Disposed) DisposedException();
                for (int i = 0; i < childBuf.Count; i++)
                {
                    childBuf[i].childBufFlag = false;
                }
                AddChildToBuf(childBuf);
                return childBuf.ToArray();
            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private readonly List<Cbbnk> _ProxyChildren = new List<Cbbnk>();
        protected void AddProxyChild(Cbbnk bbnk)
        {
            if (_ProxyChildren.Contains(bbnk))
            {

            }
            else
            {
                _ProxyChildren.Add(bbnk);
            }
        }
        protected void RemoveProxyChild(Cbbnk bbnk)
        {
            if (_ProxyChildren.Contains(bbnk))
            {
                _ProxyChildren.Remove(bbnk);
            }
            else
            {

            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        private Cbbnk? _ProxySource;

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
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
        {
            get
            {
                if (Disposed) DisposedException();
                if (_ProxySource is null) return false;
                return (_ProxySource != this);
            }
            set
            {
                if (Disposed) DisposedException();
                if (!value)
                {
                    Dispose();
                    //ProxySource = this;
                }
            }
        }
        protected virtual void Clear()
        {
            if (Disposed) DisposedException();

            while (_ProxyChildren.Count > 0)
            {
                _ProxyChildren[0].IsProxy = false;

            }
            if (!IsProxy)
            {
                List<KeyValuePair<string, Cbbnk>> lst = _Children.ToList();
                for (int i = 0; i < lst.Count; i++)
                {
                    lst[i].Value.Dispose();
                }
            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        bool Disposed = false;
        public void Dispose()
        {
            if (Disposed) 
                return;
            if (!IsProxy)
            {
                Parent = null;
            }
            
            Clear();
            ProxySource = this;
            RemoveObject(this);
            Disposed = true;
        }
    }
    public class CUser : Cbbnk
    {
        public CUser() : base()
        {

        }

        public string UserName
        {
            get
            {
                //sonra tanimlanancak
                return "";
            }
            set
            {

            }
        }
        public string Password
        {
            get
            {
                //sonra tanimlanancak
                return "";
            }
            set
            {

            }
        }
    }

    public class Session : Cbbnk
    {

        public Session() : base()
        {

        }
        public CUser? User { get; set; }


        public override  bool TestPermission(Permissions permission, Cbbnk target)
        {
            return true; //Simdilik
        }

        public override  void CheckPermission(Permissions permission, Cbbnk target)
        {
            if (!TestPermission(permission, target))
            {
                throw new PermissionException(permission);
            }
        }

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
        {
            //Hersey Serbest   
        }
        public override bool TestPermission(Permissions permission, Cbbnk target)
        {
            return true; //Hersey serbest
        }



    }
    public class PermissionException : Exception
    {
        public PermissionException(Permissions permission) : base()
        {
            Permission = permission;

        }
        public Permissions Permission;
        public override string Message
        {
            get
            {
                return "Permission Error (" + Permission.ToString() + ")";
            }
        }
    }
    public enum Permissions {
        select,
        updateParent,
        updateValue,
        updateName,
        createAnyBbnk
    }


   
}
